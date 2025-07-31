import React, { ReactNode } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, TouchableOpacityProps, View } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
    title?: string;
    loading?: boolean;
    children?: ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ title, loading, children, style, ...props }) => {
    return (
        <TouchableOpacity
            style={[styles.button, style, props.disabled && styles.disabled]}
            activeOpacity={0.8}
            {...props}
        >
            {loading ? (
                <ActivityIndicator color="#fff" />
            ) : (
                <View style={styles.content}>
                  {children}
                  {title && <Text style={styles.text}>{title}</Text>}
                </View>
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
        flexDirection: 'row', 
        justifyContent: 'center',
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    text: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
        marginLeft: 8, 
    },
    disabled: {
        opacity: 0.6,
    },
});

export default Button;
