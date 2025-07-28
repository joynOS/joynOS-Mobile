import * as React from 'react';
import * as Google from 'expo-auth-session/providers/google';
import { signInWithCredential, GoogleAuthProvider } from 'firebase/auth';
import { auth } from './firebase';

export function useGoogleAuth() {
    const [request, response, promptAsync] = Google.useAuthRequest({
        androidClientId: '972476786068-v9edhiv4u0e9slcqtjb47efqm3es6s1c.apps.googleusercontent.com',
        clientId: 'd6d97339-42d2-479a-b1f8-4b907a205e83.apps.googleusercontent.com',
        webClientId: '972476786068-tp5lpjjtm2mh6esj9iplj8l86tom1odi.apps.googleusercontent.com',
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