import * as React from 'react';
import * as Google from 'expo-auth-session/providers/google';

export function useGoogleAuth() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: '731683393524-8q359dv37vdnu8rcdocchpuqtfnn8g1h.apps.googleusercontent.com',
    clientId: '731683393524-8q359dv37vdnu8rcdocchpuqtfnn8g1h.apps.googleusercontent.com',
    webClientId: '731683393524-am36m7i43s2evv9ju99it2t7b8e385dk.apps.googleusercontent.com',
  });

  React.useEffect(() => {
    if (response?.type === 'success') {
      // Aqui você pode enviar o id_token ao backend (quando expor o endpoint social)
    }
  }, [response]);
  return { request, promptAsync, response };
}