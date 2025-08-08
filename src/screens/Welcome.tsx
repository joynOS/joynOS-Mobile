import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
    View, Text, Image, StyleSheet, ScrollView, KeyboardAvoidingView,
    Platform, SafeAreaView, StatusBar
} from 'react-native';

import Button from '../components/Button';
import PhoneAuth from '../components/PhoneAuth';
import LoadingSpinner from '../components/LoadSpinner';
import AppleIcon from '../components/icons/AppleIcon';
import { useAssets } from 'expo-asset';

import { RootStackParamList } from '../navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useGoogleAuth } from '../hooks/googleLogin';
import GoogleIcon from '../components/icons/GoogleIcon';
import FacebookIcon from '../components/icons/FacebookIcon';



type WelcomeNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Welcome'>;

export default function Welcome() {
    const navigation = useNavigation<WelcomeNavigationProp>();
    const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showPhoneAuth, setShowPhoneAuth] = useState(false);
    const [phone, setPhone] = useState('');
    const [assets] = useAssets([require('../../assets/JoynOS_Logo.png')]);

    const { request, promptAsync, response } = useGoogleAuth();

    useEffect(() => {
        if (response?.type === 'success') {
            setIsLoading(true);
            setIsLoading(false);
        }
    }, [response]);

    const handleGoogleSignIn = () => {
        promptAsync();
    };

    // const handleSocialAuth = async (provider: string) => {
    //   if (provider === 'google') {
    //     handleGoogleSignIn();
    //     return;
    //   }
    //   try {
    //       setIsLoading(true);
    //       await new Promise((res) => setTimeout(res, 1500));
    //       navigation.navigate('PersonalityQuiz');
    //   } catch (error) {
    //       console.error('Auth error:', error);
    //   } finally {
    //       setIsLoading(false);
    //   }
    // };

    const handleSocialAuth = async (provider: string) => {
        try {
            setLoadingProvider(provider);
            if (provider === 'google') {
                await handleGoogleSignIn();
                return;
            } else {
                await new Promise((res) => setTimeout(res, 1500));
                navigation.navigate('PersonalityQuiz', {});
            }
        } catch (error) {
            console.error('Auth error:', error);
        } finally {
            setLoadingProvider(null);
        }
    };


    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                    {/* Header com logo */}
                    <View style={styles.header}>
                        <View style={styles.logoWrapper}>
                            <View style={styles.logoGlow} />
                            {assets ? (
                                <Image source={{ uri: assets[0].localUri || assets[0].uri }} style={styles.logo} />
                            ) : (
                                <LoadingSpinner size="sm" />
                            )}
                        </View>
                        <Text style={styles.title}>Welcome to Joyn</Text>
                        <Text style={styles.subtitle}>
                            Discover events that match your vibe.{'\n'}
                            Meet people who share your energy.
                        </Text>
                    </View>

                    {/* Conteúdo principal */}
                    <View style={styles.card}>
                        {!showPhoneAuth ? (
                            <>
                                <Button
                                    onPress={() => handleSocialAuth('google')}
                                    loading={loadingProvider === 'google'}
                                    disabled={!request || loadingProvider !== null}
                                    style={[styles.socialButton, styles.googleButton]}
                                    title={loadingProvider === 'google' ? '' : 'Continue with Google'}
                                >
                                    {loadingProvider === 'google' ? (
                                        <LoadingSpinner size="sm" />
                                    ) : (
                                        <GoogleIcon />
                                    )}
                                </Button>

                                <Button
                                    onPress={() => handleSocialAuth('apple')}
                                    loading={loadingProvider === 'apple'}
                                    disabled={loadingProvider !== null}
                                    style={[styles.socialButton, styles.googleButton]}
                                    title={loadingProvider === 'apple' ? '' : 'Continue with Apple'}
                                >
                                    {loadingProvider === 'apple' ? (
                                        <LoadingSpinner size="sm" />
                                    ) : (
                                        <AppleIcon />
                                    )}
                                </Button>

                                <Button
                                    onPress={() => handleSocialAuth('facebook')}
                                    loading={loadingProvider === 'facebook'}
                                    disabled={loadingProvider !== null}
                                    style={[styles.socialButton, styles.facebookButton]}
                                    title={loadingProvider === 'facebook' ? '' : 'Continue with Facebook'}
                                >
                                    {loadingProvider === 'facebook' ? (
                                        <LoadingSpinner size="sm" />
                                    ) : (
                                        <FacebookIcon />
                                    )}
                                </Button>


                                <Text style={styles.orText}>or</Text>

                                <Button
                                    onPress={() => setShowPhoneAuth(true)}
                                    style={styles.phoneButton}
                                    title="Continue with Phone"
                                />
                            </>
                        ) : (
                            <PhoneAuth
                                phone={phone}
                                setPhone={setPhone}
                                onSubmit={() => navigation.navigate('PersonalityQuiz', { phone })}
                                onBack={() => setShowPhoneAuth(false)}
                            />
                        )}
                    </View>

                    <Text style={styles.footerText}>
                        By continuing, you agree to our{' '}
                        <Text style={styles.linkText} onPress={() => navigation.navigate('Terms')}>Terms</Text> and{' '}
                        <Text style={styles.linkText} onPress={() => navigation.navigate('Privacy')}>Privacy Policy</Text>
                    </Text>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({

    safeArea: {
        flex: 1,
        backgroundColor: '#000',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    flex: {
        flex: 1,
        backgroundColor: '#000',
    },
    container: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingVertical: 40,
        justifyContent: 'space-between',
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    logoWrapper: {
        position: 'relative',
        marginBottom: 20,
    },
    logoGlow: {
        position: 'absolute',
        top: -20,
        left: -20,
        right: -20,
        bottom: -20,
        backgroundColor: 'rgba(30, 194, 139, 0.3)',
        borderRadius: 20,
        zIndex: -1,
        shadowColor: '#1EC28B',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 30,
    },
    logo: {
        width: 64,
        height: 64,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    title: {
        fontSize: 32,
        color: '#fff',
        fontWeight: 'bold',
        marginBottom: 6,
    },
    subtitle: {
        color: '#ccc',
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 22,
    },
    card: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 24,
        padding: 24,
        shadowColor: '#1EC28B',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 30,
        elevation: 10,
    },
    socialButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        height: 56,
    },
    googleButton: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderColor: 'rgba(255,255,255,0.2)',
        borderWidth: 1,
    },
    facebookButton: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderColor: 'rgba(255,255,255,0.2)',
        borderWidth: 1,
    },
    phoneButton: {
        backgroundColor: 'transparent',
        borderColor: 'rgba(255,255,255,0.3)',
        borderWidth: 1,
    },
    orText: {
        color: '#999',
        textAlign: 'center',
        marginVertical: 12,
        fontSize: 14,
    },
    footerText: {
        color: 'rgba(255,255,255,0.6)',
        textAlign: 'center',
        fontSize: 12,
        marginTop: 40,
    },
    linkText: {
        textDecorationLine: 'underline',
        color: 'rgba(255,255,255,0.8)',
    },
});
