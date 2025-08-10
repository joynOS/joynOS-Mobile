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
    await AsyncStorage.multiSet([
      [ACCESS_TOKEN_KEY, tokens.accessToken],
      [REFRESH_TOKEN_KEY, tokens.refreshToken],
    ]);
  },
  async clear() {
    await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);
  },
};

export const http = axios.create({ baseURL: BASE_URL });

http.interceptors.request.use(async (config) => {
  const token = await tokenStorage.getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let pending: Array<(token: string | null) => void> = [];

http.interceptors.response.use(
  (resp) => resp,
  async (error) => {
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
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);
