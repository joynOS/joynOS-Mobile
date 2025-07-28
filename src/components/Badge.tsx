import React from "react"
import { Text, View, TouchableOpacity, StyleSheet, ViewProps, TextStyle, ViewStyle } from "react-native"

type Variant = "default" | "secondary" | "destructive" | "outline"

interface BadgeProps extends ViewProps {
    variant?: Variant
    children: React.ReactNode
    style?: ViewStyle
    textStyle?: TextStyle
}

const getVariantStyles = (variant: Variant = "default") => {
    switch (variant) {
        case "default":
            return {
                container: {
                    backgroundColor: "#3b82f6", // bg-primary
                    borderColor: "transparent",
                },
                text: {
                    color: "#ffffff", // text-primary-foreground
                },
            }
        case "secondary":
            return {
                container: {
                    backgroundColor: "#e5e7eb", // bg-secondary
                    borderColor: "transparent",
                },
                text: {
                    color: "#1f2937", // text-secondary-foreground
                },
            }
        case "destructive":
            return {
                container: {
                    backgroundColor: "#ef4444", // bg-destructive
                    borderColor: "transparent",
                },
                text: {
                    color: "#ffffff", // text-destructive-foreground
                },
            }
        case "outline":
            return {
                container: {
                    backgroundColor: "transparent",
                    borderColor: "#1f2937", // neutral border
                },
                text: {
                    color: "#1f2937", // text-foreground
                },
            }
        default:
            return {}
    }
}

export function Badge({ variant = "default", children, style, textStyle, ...props }: BadgeProps) {
    const variantStyles = getVariantStyles(variant)

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            {...props}
            style={[
                styles.container,
                variantStyles.container,
                style,
                variant === "outline" && { borderWidth: 1 },
            ]}
        >
            <Text style={[styles.text, variantStyles.text, textStyle]}>
                {children}
            </Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 9999,
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderWidth: 1,
        alignSelf: "flex-start",
    },
    text: {
        fontSize: 12,
        fontWeight: "600",
    },
})
