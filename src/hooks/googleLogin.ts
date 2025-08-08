import * as React from 'react';
import * as Google from 'expo-auth-session/providers/google';
import { signInWithCredential, GoogleAuthProvider } from 'firebase/auth';
import { auth } from './firebase';

export function useGoogleAuth() {
    const [request, response, promptAsync] = Google.useAuthRequest({
        androidClientId: '731683393524-8q359dv37vdnu8rcdocchpuqtfnn8g1h.apps.googleusercontent.com',
        clientId: '731683393524-8q359dv37vdnu8rcdocchpuqtfnn8g1h.apps.googleusercontent.com',
        webClientId: '731683393524-am36m7i43s2evv9ju99it2t7b8e385dk.apps.googleusercontent.com',
    });

    React.useEffect(() => {
        if (response?.type === 'success') {
            const { idToken } = response.authentication!;
            if (idToken) {
                const credential = GoogleAuthProvider.credential(idToken);
                signInWithCredential(auth, credential).catch((error) => {
                    console.error('Erro no login com Google:', error);
                });
            } else {
                console.error('idToken não encontrado na resposta de autenticação.');
            }
        }
    }, [response]);
    return { request, promptAsync, response };
}