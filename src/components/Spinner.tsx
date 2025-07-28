import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

const Spinner = () => {
    const rotateAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            })
        ).start();
    }, []);

    const rotation = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <Animated.View
            style={[
                styles.spinner,
                { transform: [{ rotate: rotation }] }
            ]}
        />
    );
};

const styles = StyleSheet.create({
    spinner: {
        width: 24,
        height: 24,
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.2)',
        borderTopColor: '#00C48C',
        borderRadius: 12,
    },
});

export default Spinner;
