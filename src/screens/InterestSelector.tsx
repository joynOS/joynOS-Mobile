import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft } from 'lucide-react-native';
import { Button } from '../components/Button';
import LoadingSpinner from '../components/LoadSpinner';
import InterestItem from '../components/InterestItem';
import DistanceSlider from '../components/DistanceSlider';
import { INTERESTS } from '../utils';


export default function InterestSelector() {
    const navigation = useNavigation();
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    const [radius, setRadius] = useState(10);
    const [isLoading, setIsLoading] = useState(false);

    const toggleInterest = (interest: string) => {
        setSelectedInterests(prev =>
            prev.includes(interest)
                ? prev.filter(i => i !== interest)
                : [...prev, interest]
        );
    };

    const handleComplete = async () => {
        if (selectedInterests.length < 3) return;
        setIsLoading(true);

        // simula uma chamada de API
        setTimeout(() => {
            setIsLoading(false);
            //navigation.navigate('Home'); // Ou sua próxima rota
        }, 1500);
    };

    return (
        <View style={styles.container}>
            {/* Top Header */}
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft color="white" size={20} />
                </Pressable>
                <Text style={styles.stepLabel}>Final Step</Text>
            </View>

            <Text style={styles.title}>What interests you?</Text>
            <Text style={styles.subtitle}>
                Select at least 3 interests to help us find your perfect events
            </Text>

            {/* Scrollable Interests */}
            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={styles.interestGrid}>
                    {INTERESTS.map((item) => (
                        <InterestItem
                            key={item}
                            label={item}
                            selected={selectedInterests.includes(item)}
                            onPress={() => toggleInterest(item)}
                        />
                    ))}
                </View>

                <View style={styles.selectionCount}>
                    <Text style={{ color: selectedInterests.length >= 3 ? '#00C48C' : '#ccc' }}>
                        {selectedInterests.length}/3 selected
                    </Text>
                </View>

                {/* Distance Slider */}
                <View style={styles.sliderContainer}>
                    <Text style={styles.sliderLabel}>Discovery Radius: {radius} miles</Text>
                    <DistanceSlider value={radius} onChange={setRadius} />
                </View>
            </ScrollView>

            {/* Complete Button */}
            <View style={styles.footer}>
                <Button
                    onPress={handleComplete}
                    disabled={selectedInterests.length < 3 || isLoading}
                    loading={isLoading}
                    title={`Complete Setup (${selectedInterests.length}/3)`}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'black', paddingHorizontal: 20 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 50,
        marginBottom: 10,
    },
    backButton: {
        padding: 8,
        marginRight: 12,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 8,
    },
    stepLabel: {
        color: '#00C48C',
        fontSize: 14,
        fontWeight: '600',
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: 'white',
        marginBottom: 4,
    },
    subtitle: {
        color: '#ccc',
        fontSize: 14,
        marginBottom: 20,
    },
    scroll: { paddingBottom: 100 },
    interestGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        justifyContent: 'space-between',
    },
    selectionCount: {
        marginTop: 16,
        alignItems: 'center',
    },
    sliderContainer: {
        marginTop: 32,
    },
    sliderLabel: {
        color: 'white',
        marginBottom: 8,
        fontWeight: '600',
    },
    footer: {
        paddingVertical: 16,
        backgroundColor: 'black',
    },
});
