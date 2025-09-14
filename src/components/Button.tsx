import React, { ReactNode } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, TouchableOpacityProps, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ButtonProps extends TouchableOpacityProps {
    title?: string;
    loading?: boolean;
    children?: ReactNode;
    type?: 'primary' | 'gradient';
}

export const Button: React.FC<ButtonProps> = ({ title, loading, children, style, type = 'primary', ...props }) => {
    return (
        <TouchableOpacity
            style={[styles.button, type === 'primary' && styles.primaryButton, style, props.disabled && styles.disabled]}
            activeOpacity={0.8}
            {...props}
        >
            {type === 'gradient' ? (
                <LinearGradient
                    colors={['#cc5c24', 'hsl(258, 100%, 67%)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.gradientContainer}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <View style={styles.content}>
                          {children}
                          {title && <Text style={styles.text}>{title}</Text>}
                        </View>
                    )}
                </LinearGradient>
            ) : (
                <>
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <View style={styles.content}>
                          {children}
                          {title && <Text style={styles.text}>{title}</Text>}
                        </View>
                    )}
                </>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
        flexDirection: 'row', 
        justifyContent: 'center',
    },
    primaryButton: {
        backgroundColor: '#cc5c24',
    },
    gradientContainer: {
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
        flexDirection: 'row', 
        justifyContent: 'center',
        width: '100%',
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
