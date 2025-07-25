import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ArrowLeft, Sparkles } from 'lucide-react-native';
import ProgressBar from './ProgressBar';

interface QuizHeaderProps {
    onBack: () => void;
    current: number;
    total: number;
}

export default function QuizHeader({ onBack, current, total }: QuizHeaderProps) {
    const progress = ((current + 1) / total) * 100;

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <TouchableOpacity onPress={onBack} style={styles.iconButton}>
                    <ArrowLeft size={18} color="white" />
                </TouchableOpacity>
                <View style={styles.progressText}>
                    <Sparkles size={14} color="white" />
                    <Text style={styles.counter}>{current + 1} of {total}</Text>
                </View>
            </View>
            <ProgressBar progress={progress} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 12,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    iconButton: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 8,
    },
    progressText: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    counter: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
    },
});
