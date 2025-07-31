import React, { ReactNode, useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    StyleSheet,
    Dimensions,
    LayoutRectangle,
    TouchableWithoutFeedback,
    Animated,
} from 'react-native';

const SCREEN_PADDING = 8;
const TOOLTIP_WIDTH = 200;
const TOOLTIP_HEIGHT = 40;

type TooltipProps = {
    children: ReactNode;
    content: string | ReactNode;
    placement?: 'top' | 'bottom' | 'left' | 'right';
};

export function TipAnimate({
    children,
    content,
    placement = 'top',
}: TooltipProps) {
    const [visible, setVisible] = useState(false);
    const [triggerLayout, setTriggerLayout] = useState<LayoutRectangle | null>(null);
    const opacity = useRef(new Animated.Value(0)).current;

    const openTooltip = () => {
        setVisible(true);
        Animated.timing(opacity, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
        }).start();
    };

    const closeTooltip = () => {
        Animated.timing(opacity, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
        }).start(() => setVisible(false));
    };

    const calculatePosition = () => {
        if (!triggerLayout) return { top: 0, left: 0 };

        const screenWidth = Dimensions.get('window').width;
        const screenHeight = Dimensions.get('window').height;

        const { x, y, width, height } = triggerLayout;
        const midX = x + width / 2;
        const midY = y + height / 2;

        let top = y;
        let left = x;

        switch (placement) {
            case 'top':
                top = Math.max(SCREEN_PADDING, y - TOOLTIP_HEIGHT - 8);
                left = Math.min(
                    screenWidth - TOOLTIP_WIDTH - SCREEN_PADDING,
                    Math.max(SCREEN_PADDING, midX - TOOLTIP_WIDTH / 2)
                );
                break;
            case 'bottom':
                top = Math.min(screenHeight - TOOLTIP_HEIGHT - SCREEN_PADDING, y + height + 8);
                left = Math.min(
                    screenWidth - TOOLTIP_WIDTH - SCREEN_PADDING,
                    Math.max(SCREEN_PADDING, midX - TOOLTIP_WIDTH / 2)
                );
                break;
            case 'left':
                top = Math.max(SCREEN_PADDING, midY - TOOLTIP_HEIGHT / 2);
                left = Math.max(SCREEN_PADDING, x - TOOLTIP_WIDTH - 8);
                break;
            case 'right':
                top = Math.max(SCREEN_PADDING, midY - TOOLTIP_HEIGHT / 2);
                left = Math.min(screenWidth - TOOLTIP_WIDTH - SCREEN_PADDING, x + width + 8);
                break;
        }

        return { top, left };
    };

    const { top, left } = calculatePosition();

    return (
        <>
            <TouchableOpacity
                onLayout={(event) => setTriggerLayout(event.nativeEvent.layout)}
                onPressIn={openTooltip}
                onPressOut={closeTooltip}
                activeOpacity={0.7}
            >
                {children}
            </TouchableOpacity>

            <Modal transparent visible={visible} animationType="none">
                <TouchableWithoutFeedback onPress={closeTooltip}>
                    <View style={styles.modalBackground}>
                        {triggerLayout && (
                            <Animated.View
                                style={[
                                    styles.tooltipContainer,
                                    {
                                        top,
                                        left,
                                        opacity,
                                    },
                                ]}
                            >
                                <Text style={styles.tooltipText}>{content}</Text>
                            </Animated.View>
                        )}
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
    },
    tooltipContainer: {
        position: 'absolute',
        width: TOOLTIP_WIDTH,
        height: TOOLTIP_HEIGHT,
        backgroundColor: '#1F2937', // Tailwind: bg-popover dark
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        borderColor: '#374151', // border
        borderWidth: 1,
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
    },
    tooltipText: {
        color: '#F9FAFB', // text-popover-foreground
        fontSize: 13,
    },
});
