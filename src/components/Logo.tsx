import React from 'react';
import { View, ActivityIndicator, StyleSheet, Image } from 'react-native';
import { useAssets } from 'expo-asset';

export default function Logo() {
    const [assets] = useAssets([
        require('../../assets/JoynOS_Logo.png')
    ]);

    if (!assets) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator color="#1EC28B" />
            </View>
        );
    }

    // 🏷️ Atribui nomes aos assets carregados
    // const [joynLogo] = assets;

    return (
        <Image
            source={{ uri: assets[0].localUri || assets[0].uri }}
            style={styles.logo}
            resizeMode="contain"
        />
    );
}

const styles = StyleSheet.create({
    loaderContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
    },
    logo: {
        width: 64,
        height: 64,
        borderRadius: 16,
    },
});
