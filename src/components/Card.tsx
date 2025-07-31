import React, { forwardRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ViewStyle,
    TextStyle,
    ViewProps,
} from 'react-native';

type CardProps = ViewProps & {
    style?: ViewStyle;
};

export const Card = forwardRef<View, CardProps>(({ style, ...props }, ref) => {
    return <View ref={ref} style={[styles.card, style]} {...props} />;
});

export const CardHeader = forwardRef<View, CardProps>(
    ({ style, ...props }, ref) => {
        return <View ref={ref} style={[styles.cardHeader, style]} {...props} />;
    }
);

export const CardTitle = forwardRef<Text, { style?: TextStyle }>(
    ({ style, ...props }, ref) => {
        return (
            <Text ref={ref} style={[styles.cardTitle, style]} {...props} />
        );
    }
);

export const CardDescription = forwardRef<Text, { style?: TextStyle }>(
    ({ style, ...props }, ref) => {
        return (
            <Text ref={ref} style={[styles.cardDescription, style]} {...props} />
        );
    }
);

export const CardContent = forwardRef<View, CardProps>(
    ({ style, ...props }, ref) => {
        return <View ref={ref} style={[styles.cardContent, style]} {...props} />;
    }
);

export const CardFooter = forwardRef<View, CardProps>(
    ({ style, ...props }, ref) => {
        return <View ref={ref} style={[styles.cardFooter, style]} {...props} />;
    }
);

const styles = StyleSheet.create({
    card: {
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'column',
        padding: 24,
        gap: 6,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: '600',
        lineHeight: 28,
        color: '#111827',
    },
    cardDescription: {
        fontSize: 14,
        color: '#6b7280',
    },
    cardContent: {
        padding: 24,
        paddingTop: 0,
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 24,
        paddingTop: 0,
    },
});
