import React, { ReactNode, useState, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    StyleSheet,
    Dimensions,
    LayoutRectangle,
    TouchableWithoutFeedback,
} from 'react-native';

const SCREEN_PADDING = 8;

type TooltipProps = {
    children: ReactNode;
    content: string | ReactNode;
};

export function Tooltip({ children, content }: TooltipProps) {
    const [visible, setVisible] = useState(false);
    const [triggerLayout, setTriggerLayout] = useState<LayoutRectangle | null>(null);
    //const triggerRef = useRef<TouchableOpacity>(null);
    const triggerRef = useRef<React.ComponentRef<typeof TouchableOpacity>>(null);


    const openTooltip = () => setVisible(true);
    const closeTooltip = () => setVisible(false);

    return (
        <>
            <TouchableOpacity
                ref={triggerRef}
                onLayout={(event) => setTriggerLayout(event.nativeEvent.layout)}
                onPressIn={openTooltip}
                onPressOut={closeTooltip}
                activeOpacity={0.7}
            >
                {children}
            </TouchableOpacity>

            <Modal transparent visible={visible} animationType="fade">
                <TouchableWithoutFeedback onPress={closeTooltip}>
                    <View style={styles.modalBackground}>
                        {triggerLayout && (
                            <View
                                style={[
                                    styles.tooltipContainer,
                                    {
                                        top: triggerLayout.y - 40,
                                        left: Math.min(
                                            triggerLayout.x,
                                            Dimensions.get('window').width - 200 - SCREEN_PADDING
                                        ),
                                    },
                                ]}
                            >
                                <Text style={styles.tooltipText}>
                                    {content}
                                </Text>
                            </View>
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
        backgroundColor: 'transparent',
    },
    tooltipContainer: {
        position: 'absolute',
        maxWidth: 200,
        backgroundColor: '#1F2937', // tailwind: bg-popover (dark)
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
        borderColor: '#374151', // border
        borderWidth: 1,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        zIndex: 999,
    },
    tooltipText: {
        color: '#F9FAFB', // text-popover-foreground
        fontSize: 13,
    },
});
