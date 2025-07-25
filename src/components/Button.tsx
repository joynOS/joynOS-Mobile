import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, TouchableOpacityProps } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
    title: string;
    loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ title, loading, style, ...props }) => {
    return (
        <TouchableOpacity
            style={[styles.button, style, props.disabled && styles.disabled]}
            activeOpacity={0.8}
            {...props}
        >
            {loading ? (
                <ActivityIndicator color="#fff" />
            ) : (
                <Text style={styles.text}>{title}</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#1EC28B',
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    text: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
    disabled: {
        opacity: 0.6,
    },
});

export default Button;
