import React from "react"
import {
    Text,
    View,
    TouchableOpacity,
    StyleSheet,
    ViewStyle,
    TextStyle,
    TouchableOpacityProps,
} from "react-native"

type Variant = "default" | "secondary" | "destructive" | "outline"

interface BadgeProps extends TouchableOpacityProps {
    variant?: Variant
    children: React.ReactNode
    style?: ViewStyle
    textStyle?: TextStyle
    removable?: boolean
    onRemove?: () => void
    selected?: boolean
}

const getVariantStyles = (variant: Variant = "default") => {
    switch (variant) {
        case "default":
            return {
                container: { backgroundColor: "#3b82f6", borderColor: "transparent" },
                text: { color: "#ffffff" },
            }
        case "secondary":
            return {
                container: { backgroundColor: "#e5e7eb", borderColor: "transparent" },
                text: { color: "#1f2937" },
            }
        case "destructive":
            return {
                container: { backgroundColor: "#ef4444", borderColor: "transparent" },
                text: { color: "#ffffff" },
            }
        case "outline":
            return {
                container: { backgroundColor: "transparent", borderColor: "#1f2937" },
                text: { color: "#1f2937" },
            }
        default:
            return {
                container: {},
                text: {},
            }
    }
}

export function Badge({
    variant = "default",
    children,
    style,
    textStyle,
    removable,
    onRemove,
    selected,
    ...props
}: BadgeProps) {
    const variantStyles = getVariantStyles(variant)

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            {...props}
            style={[
                styles.container,
                variantStyles.container,
                variant === "outline" && { borderWidth: 1 },
                selected && styles.selected,
                style,
            ]}
        >
            <View style={styles.content}>
                <Text style={[styles.text, variantStyles.text, textStyle]}>{children}</Text>

                {removable && (
                    <TouchableOpacity onPress={onRemove} style={styles.removeButton}>
                        <Text style={[styles.removeText, { color: variantStyles.text.color }]}>×</Text>
                    </TouchableOpacity>
                )}
            </View>
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
    content: {
        flexDirection: "row",
        alignItems: "center",
    },
    text: {
        fontSize: 12,
        fontWeight: "600",
    },
    removeButton: {
        marginLeft: 6,
        paddingHorizontal: 4,
    },
    removeText: {
        fontSize: 14,
        fontWeight: "bold",
    },
    selected: {
        backgroundColor: "#dbeafe", // azul claro
        borderColor: "#3b82f6",     // azul forte
    },
})
