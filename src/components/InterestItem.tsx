import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';

interface Props {
    label: string;
    selected: boolean;
    onPress: () => void;
}

export function InterestItem({ label, selected, onPress }: Props) {
    return (
        <Pressable
            onPress={onPress}
            style={[
                styles.item,
                selected && styles.selectedItem
            ]}
        >
            <Text style={[styles.label, selected && styles.selectedLabel]}>
                {label}
            </Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    item: {
        padding: 10,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        marginBottom: 10,
        width: '48%',
    },
    selectedItem: {
        backgroundColor: 'rgba(204, 92, 36, 0.2)',
        borderColor: '#cc5c24',
    },
    label: {
        color: '#ccc',
        fontSize: 13,
        textAlign: 'center',
    },
    selectedLabel: {
        color: 'white',
        fontWeight: '600',
    },
});

export default InterestItem;
