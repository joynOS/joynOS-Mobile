import { http } from "./http";
import type { Me } from "../types/api";

export const userService = {
  async updateProfile(payload: { name?: string; bio?: string; avatar?: any }) {
    if (
      payload.avatar &&
      typeof payload.avatar === "object" &&
      payload.avatar.uri
    ) {
      const formData = new FormData();
      if (payload.name) formData.append("name", payload.name);
      if (payload.bio) formData.append("bio", payload.bio);
      formData.append("avatar", {
        uri: payload.avatar.uri,
        type: payload.avatar.type || "image/jpeg",
        name: payload.avatar.name || "avatar.jpg",
      } as any);

      const { data } = await http.patch<Me>("/me", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return data;
    } else {
      const { data } = await http.patch<Me>("/me", payload);
      return data;
    }
  },
  async updatePreferences(payload: {
    currentLat: number;
    currentLng: number;
    radiusMiles: number;
  }) {
    const { data } = await http.put<Me>("/me/preferences", payload);
    return data;
  },
  async updateInterests(payload: { interestIds: string[] }) {
    const { data } = await http.put<Me>("/me/interests", payload);
    return data;
  },
};
