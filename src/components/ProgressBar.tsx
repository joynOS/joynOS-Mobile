import React from 'react';
import { View, Animated, StyleSheet } from 'react-native';

interface ProgressBarProps {
    progress: number; // 0 - 100
}

export default function ProgressBar({ progress }: ProgressBarProps) {
    return (
        <View style={styles.container}>
            <Animated.View style={[styles.bar, { width: `${progress}%` }]} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 6,
        width: '100%',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 4,
        overflow: 'hidden',
    },
    bar: {
        height: '100%',
        backgroundColor: '#8AE68C', // Joyn green
        borderRadius: 4,
    },
});
