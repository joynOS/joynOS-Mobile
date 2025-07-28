import React, { useState } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    Pressable
} from 'react-native';
import { ChevronDown, Check } from 'lucide-react-native';

interface SelectProps {
    value: string;
    options: string[];
    placeholder?: string;
    onChange: (value: string) => void;
}

export const Select = ({
    value,
    options,
    placeholder = 'Select...',
    onChange,
}: SelectProps) => {
    const [open, setOpen] = useState(false);

    const handleSelect = (option: string) => {
        onChange(option);
        setOpen(false);
    };

    return (
        <>
            {/* Trigger */}
            <Pressable
                style={styles.trigger}
                onPress={() => setOpen(true)}
            >
                <Text
                    style={[
                        styles.triggerText,
                        value ? styles.text : styles.placeholder
                    ]}
                    numberOfLines={1}
                >
                    {value || placeholder}
                </Text>
                <ChevronDown size={16} color="#999" />
            </Pressable>

            {/* Modal Content */}
            <Modal
                animationType="slide"
                transparent
                visible={open}
                onRequestClose={() => setOpen(false)}
            >
                <TouchableOpacity
                    style={styles.overlay}
                    activeOpacity={1}
                    onPressOut={() => setOpen(false)}
                >
                    <View style={styles.content}>
                        <FlatList
                            data={options}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.item}
                                    onPress={() => handleSelect(item)}
                                >
                                    <View style={styles.checkContainer}>
                                        {value === item && <Check size={16} color="#16a34a" />}
                                    </View>
                                    <Text
                                        style={[
                                            styles.itemText,
                                            value === item && styles.selectedText
                                        ]}
                                    >
                                        {item}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    trigger: {
        height: 40,
        width: '100%',
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#d1d5db',
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    triggerText: {
        flex: 1,
        fontSize: 14,
    },
    placeholder: {
        color: '#9ca3af',
    },
    text: {
        color: '#111827',
    },
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    content: {
        backgroundColor: 'white',
        padding: 8,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        maxHeight: '50%',
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 6,
    },
    checkContainer: {
        width: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemText: {
        fontSize: 14,
        color: '#111827',
    },
    selectedText: {
        fontWeight: '600',
        color: '#16a34a',
    },
});
