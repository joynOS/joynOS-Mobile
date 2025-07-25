import React from 'react';
import { TextInput, TextInputProps, StyleSheet, View } from 'react-native';

export const Input: React.FC<TextInputProps> = (props) => {
    return (
        <View style={styles.wrapper}>
            <TextInput
                style={styles.input}
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                {...props}
                
            />
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 8,
        borderColor: 'rgba(255,255,255,0.2)',
        borderWidth: 1,
        marginBottom: 12,
    },
    input: {
        height: 56,
        paddingHorizontal: 16,
        color: '#fff',
        fontSize: 16,
    },
});

export default Input;