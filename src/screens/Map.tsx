import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { MapPin, Search, Filter, Plus } from 'lucide-react-native';
import Button from '../components/Button';
import { Input } from '../components/Input';
import ButtonUpdate from '../components/ButtonUpdate';

const { width, height } = Dimensions.get('window');

export default function Map() {
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <Text style={styles.title}>Event Map</Text>
                    <ButtonUpdate variant="ghost" size="icon" onPress={() => {}}>
                        <Filter size={24} color="#666" />
                    </ButtonUpdate>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Search size={20} color="#999" style={styles.searchIcon} />
                    <Input
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Search locations..."
                        placeholderTextColor="#999"
                        style={styles.input}
                    />
                </View>
            </View>

            {/* Map Container */}
            <View style={styles.mapContainer}>
                <View style={styles.mapPlaceholder}>
                    <MapPin size={64} color="#999" />
                    <Text style={styles.mapTitle}>Interactive Map</Text>
                    <Text style={styles.mapDescription}>
                        This would integrate with a mapping service like Leaflet or Google Maps to show event locations with clustered pins.
                    </Text>
                </View>

                {/* Example Pins */}
                <View style={[styles.pin, styles.pinGreen, { top: height * 0.33, left: width * 0.33 }]} />
                <View style={[styles.pin, styles.pinPurple, { top: height * 0.5, right: width * 0.33 }]} />
                <View style={[styles.pin, styles.pinYellow, { bottom: height * 0.33, left: width * 0.5 }]} />

                {/* Location Button */}
                <TouchableOpacity style={styles.locationButton}>
                    <MapPin size={20} color="#000" />
                </TouchableOpacity>

                {/* Floating Action Button */}
                <TouchableOpacity style={styles.fab}>
                    <Plus size={28} color="#fff" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        paddingHorizontal: 24,
        paddingVertical: 16,
        backgroundColor: 'rgba(255,255,255,0.8)',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        // backdropFilter: 'blur(10px)', // funciona apenas no web
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    searchContainer: {
        position: 'relative',
        justifyContent: 'center',
    },
    searchIcon: {
        position: 'absolute',
        left: 12,
        zIndex: 1,
    },
    input: {
        paddingLeft: 40,
        height: 40,
        backgroundColor: '#f3f3f3',
        borderRadius: 20,
        fontSize: 16,
    },
    mapContainer: {
        flex: 1,
        backgroundColor: '#f3f3f3',
        position: 'relative',
    },
    mapPlaceholder: {
        position: 'absolute',
        top: '35%',
        alignSelf: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    mapTitle: {
        fontWeight: '600',
        fontSize: 16,
        marginTop: 12,
        marginBottom: 4,
    },
    mapDescription: {
        color: '#888',
        textAlign: 'center',
        fontSize: 14,
    },
    pin: {
        position: 'absolute',
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#fff',
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    pinGreen: {
        backgroundColor: '#2ecc71',
    },
    pinPurple: {
        backgroundColor: '#9b59b6',
    },
    pinYellow: {
        backgroundColor: '#f1c40f',
    },
    locationButton: {
        position: 'absolute',
        bottom: 100,
        right: 16,
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 100,
        borderWidth: 1,
        borderColor: '#ddd',
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 5,
        elevation: 5,
    },
    fab: {
        position: 'absolute',
        bottom: 20,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'linear-gradient(45deg, #2ecc71, #9b59b6)', // para RN use libs como expo-linear-gradient
        // backgroundColor: '#9b59b6', // fallback para RN puro
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 8,
    },
});
