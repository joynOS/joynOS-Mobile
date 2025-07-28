import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Clock, Calendar, DollarSign, MapPin } from 'lucide-react-native';

import Button from '../components/Button';
import { Badge } from '../components/Badge';
import Slider from '../components/DistanceSlider';
import { Select } from '../components/Select';

interface IntentData {
    timeframe: 'tonight' | 'this_week';
    activity: string;
    budget: number[];
    radius: number[];
}

interface LiveIntentCaptureProps {
    onIntentUpdate: (intent: IntentData) => void;
    className?: string;
}

export default function LiveIntentCapture({ onIntentUpdate }: LiveIntentCaptureProps) {
    const [intent, setIntent] = useState<IntentData>({
        timeframe: 'tonight',
        activity: '',
        budget: [50],
        radius: [5]
    });

    const activities = [
        'Nightlife & Bars',
        'Live Music & Concerts',
        'Food & Dining',
        'Art & Culture',
        'Outdoor Activities',
        'Sports & Fitness',
        'Networking & Social',
        'Learning & Workshops'
    ];

    const updateIntent = (updates: Partial<IntentData>) => {
        const newIntent = { ...intent, ...updates };
        setIntent(newIntent);
        onIntentUpdate(newIntent);
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>What's your vibe?</Text>
                <Badge variant="secondary" style={styles.badge}>
                    Live Intent
                </Badge>
            </View>

            {/* Timeframe */}
            <View>
                <Text style={styles.label}>When?</Text>
                <View style={styles.row}>
                    <View style={styles.buttonWrapper}>
                        <Clock size={16} style={styles.icon} />
                        <Button
                            title="Tonight"
                            onPress={() => updateIntent({ timeframe: 'tonight' })}
                            style={intent.timeframe === 'tonight' ? styles.selectedButton : undefined}
                        />
                    </View>

                    <View style={styles.buttonWrapper}>
                        <Calendar size={16} style={styles.icon} />
                        <Button
                            title="This Week"
                            onPress={() => updateIntent({ timeframe: 'this_week' })}
                            style={intent.timeframe === 'this_week' ? styles.selectedButton : undefined}
                        />
                    </View>
                </View>
            </View>

            {/* Activity Picker */}
            <View>
                <Text style={styles.label}>What kind of activity?</Text>
                <Select
                    // placeholder="Choose your vibe..."
                    // value={intent.activity}
                    // onValueChange={(value: string) => updateIntent({ activity: value })}
                    // items={activities.map((a) => ({ label: a, value: a }))}
                    placeholder="Choose your vibe..."
                    value={intent.activity}
                    onChange={(value: string) => updateIntent({ activity: value })}
                    options={activities} 
                />
            </View>

            {/* Budget */}
            <View>
                <Text style={styles.label}>Budget Range</Text>
                <View style={styles.sliderContainer}>
                    <Slider
                        //value={intent.budget}
                        //onValueChange={(value: number) => updateIntent({ budget: value })}
                        value={Array.isArray(intent.budget) ? intent.budget[0] : intent.budget}
                        onChange={(value: number) => updateIntent({ budget: [value] })}
                        minimumValue={10}
                        maximumValue={200}
                        step={10}
                        thumbTintColor="#00B37E"
                    />
                    <View style={styles.sliderTextRow}>
                        <Text style={styles.sliderText}>
                            <DollarSign size={14} style={styles.iconDollarSign} /> ${intent.budget[0]}
                        </Text>
                        <Text style={styles.sliderSubtext}>per person</Text>
                    </View>
                </View>
            </View>

            {/* Radius */}
            <View>
                <Text style={styles.label}>How far will you travel?</Text>
                <View style={styles.sliderContainer}>
                    <Slider
                        //value={intent.radius}
                        //onValueChange={(value) => updateIntent({ radius: value })}
                        value={Array.isArray(intent.radius) ? intent.radius[0] : intent.radius}
                        onChange={(value: number) => updateIntent({ radius: [value] })}
                        minimumValue={1}
                        maximumValue={25}
                        step={1}
                        thumbTintColor="#8F42EC"
                    />
                    <View style={styles.sliderTextRow}>
                        <Text style={styles.sliderText}>
                            <MapPin size={14} style={styles.iconDollarSign} /> {intent.radius[0]} km
                        </Text>
                        <Text style={styles.sliderSubtext}>from you</Text>
                    </View>
                </View>
            </View>

            {/* Status */}
            <View style={styles.statusBox}>
                <View style={styles.statusRow}>
                    <View style={styles.pulseDot} />
                    <Text style={styles.statusText}>Intent captured - finding matches...</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        gap: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontWeight: 'bold',
        fontSize: 18,
    },
    badge: {
        backgroundColor: '#D1FADF',
        color: '#00B37E',
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
        color: '#666',
    },
    row: {
        flexDirection: 'row',
        gap: 8,
    },
    selectedButton: {
        backgroundColor: '#00B37E',
    },
    iconDollarSign: {
        marginRight: 4,
    },
    sliderContainer: {
        gap: 12,
    },
    sliderTextRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    sliderText: {
        flexDirection: 'row',
        alignItems: 'center',
        fontSize: 14,
        color: '#666',
    },
    sliderSubtext: {
        fontWeight: '500',
        fontSize: 14,
    },
    statusBox: {
        backgroundColor: '#D1FADF50',
        borderColor: '#00B37E40',
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    pulseDot: {
        width: 8,
        height: 8,
        backgroundColor: '#00B37E',
        borderRadius: 4,
        opacity: 1,
    },
    statusText: {
        fontSize: 14,
        color: '#00B37E',
        fontWeight: '500',
    },
    buttonWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 8,
    },
    icon: {
        marginRight: 8,
        color: '#1EC28B',
    },
});
