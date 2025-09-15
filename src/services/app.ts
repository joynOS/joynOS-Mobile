import { http } from './http';

export type VersionCheckResponse = {
  updateRequired: boolean;
  forceUpdate: boolean;
  latestVersion: string;
  minimumVersion: string;
  currentVersion: string;
  updateMessage: string;
  downloadUrl: string;
};

export const appService = {
  async checkVersion(version: string, platform: 'ios' | 'android'): Promise<VersionCheckResponse> {
    const { data } = await http.get<VersionCheckResponse>(`/app/version-check`, {
      params: { version, platform }
    });
    return data;
  },
};