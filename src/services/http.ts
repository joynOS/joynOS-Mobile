import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AccessTokens } from '../types/api';

const BASE_URL = 'http://localhost:3000';
const ACCESS_TOKEN_KEY = 'auth.accessToken';
const REFRESH_TOKEN_KEY = 'auth.refreshToken';

export const tokenStorage = {
  async getAccessToken() {
    return AsyncStorage.getItem(ACCESS_TOKEN_KEY);
  },
  async getRefreshToken() {
    return AsyncStorage.getItem(REFRESH_TOKEN_KEY);
  },
  async setTokens(tokens: AccessTokens) {
    console.log("setTokens: ", tokens);
    const access = tokens?.accessToken ?? null;
    const refresh = tokens?.refreshToken ?? null;
    if (!access || !refresh) {
      await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);
      throw new Error('Invalid tokens');
    }
    await AsyncStorage.multiSet([
      [ACCESS_TOKEN_KEY, String(access)],
      [REFRESH_TOKEN_KEY, String(refresh)],
    ]);
  },
  async clear() {
    await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);
  },
};

export const http = axios.create({ baseURL: BASE_URL });

http.interceptors.request.use(async (config) => {
  console.log('📤 HTTP Request:', {
    method: config.method?.toUpperCase(),
    url: config.url,
    fullUrl: config.baseURL + config.url,
    headers: config.headers
  });
  
  // Don't add auth token for signup/signin requests
  const isAuthRequest = config.url?.includes('/auth/signup') || config.url?.includes('/auth/signin');
  console.log('🔐 Is auth request?', isAuthRequest, 'for URL:', config.url);
  
  if (!isAuthRequest) {
    const token = await tokenStorage.getAccessToken();
    console.log('🔑 Token found:', !!token);
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

let isRefreshing = false;
let pending: Array<(token: string | null) => void> = [];
let unauthorizedHandler: (() => void) | null = null;

export const setUnauthorizedHandler = (fn: (() => void) | null) => {
  unauthorizedHandler = fn;
};

http.interceptors.response.use(
  (resp) => {
    console.log('📥 HTTP Response:', {
      status: resp.status,
      url: resp.config.url,
      data: resp.data
    });
    return resp;
  },
  async (error) => {
    console.log('❌ HTTP Error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
      data: error.response?.data
    });
    
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        const token = await new Promise<string | null>((resolve) => pending.push(resolve));
        if (!token) return Promise.reject(error);
        original.headers = original.headers ?? {};
        original.headers.Authorization = `Bearer ${token}`;
        original._retry = true;
        return http(original);
      }

      original._retry = true;
      isRefreshing = true;
      try {
        const refreshToken = await tokenStorage.getRefreshToken();
        if (!refreshToken) throw error;
        const resp = await axios.post<AccessTokens>(`${BASE_URL}/auth/refresh`, null, {
          headers: { 'x-refresh-token': refreshToken },
        });
        if (!resp.data?.accessToken || !resp.data?.refreshToken) {
          throw new Error('Invalid refresh response');
        }
        await tokenStorage.setTokens(resp.data);
        pending.forEach((r) => r(resp.data.accessToken));
        pending = [];
        original.headers = original.headers ?? {};
        original.headers.Authorization = `Bearer ${resp.data.accessToken}`;
        return http(original);
      } catch (e) {
        pending.forEach((r) => r(null));
        pending = [];
        await tokenStorage.clear();
        if (unauthorizedHandler) {
          try { unauthorizedHandler(); } catch {}
        }
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);
