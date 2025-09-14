import { http, tokenStorage } from "./http";
import type { AccessTokens, Me } from "../types/api";

export const authService = {
  async signup(payload: { email: string; password: string; name: string; bio?: string; avatar?: any }) {
    const formData = new FormData();
    formData.append('email', payload.email);
    formData.append('password', payload.password);
    formData.append('name', payload.name);
    if (payload.bio) {
      formData.append('bio', payload.bio);
    }
    if (payload.avatar) {
      formData.append('avatar', {
        uri: payload.avatar.uri,
        type: payload.avatar.type || 'image/jpeg',
        name: payload.avatar.name || 'avatar.jpg',
      } as any);
    }

    const { data } = await http.post<any>("/auth/signup", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    const tokens = {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken
    };
    await tokenStorage.setTokens(tokens);
    return tokens;
  },
  async signin(payload: { email: string; password: string }) {
    const { data } = await http.post<AccessTokens>("/auth/signin", payload);
    await tokenStorage.setTokens(data);
    return data;
  },
  async logout() {
    await http.post("/auth/logout");
    await tokenStorage.clear();
  },
  async me() {
    const { data } = await http.get<Me>("/me");
    return data;
  },
  async requestPhone(payload: { phone: string }) {
    const { data } = await http.post<{ sent: boolean; code: string }>(
      "/auth/signin/phone/request",
      payload
    );
    console.log(data);
    return data;
  },
  async verifyPhone(payload: { phone: string; code: string; name?: string }) {
    const { data } = await http.post<AccessTokens>(
      "/auth/signin/phone/verify",
      payload
    );
    await tokenStorage.setTokens(data);
    return data;
  },
};
