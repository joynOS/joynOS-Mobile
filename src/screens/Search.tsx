import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, Image, TouchableOpacity, Keyboard, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SearchIcon, XIcon, ClockIcon, MapPinIcon, PlusIcon } from 'lucide-react-native';
import { useSearchEventsQuery } from '../shared/eventSlice';
import { EVENT_CATEGORIES } from '../utils';
import { Tabs, TabsContent, TabsList, TabsTrigger, Tab } from '../components/Tabs';
import { Badge } from '../components/Badge';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadSpinner';
import ButtonUpdate from '../components/ButtonUpdate';

const TRENDING_SEARCHES = [
    'Jazz night',
    'Rooftop party',
    'Art gallery',
    'Wine tasting',
    'Book club',
    'Hiking group',
];

export default function Search() {
    const navigation = useNavigation();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilters, setActiveFilters] = useState<string[]>([]);
    const [searchStarted, setSearchStarted] = useState(false);
    const [tab, setTab] = useState<'events' | 'categories' | 'filters'>('events');

    // const { data: searchResults, isLoading } = useSearchEventsQuery(
    //     { query: searchQuery },
    //     { skip: !searchQuery.trim() }
    // );

    const { data: searchResults = [], isLoading } = useSearchEventsQuery(
        { query: searchQuery },
        { skip: !searchQuery.trim() }
    );

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        setSearchStarted(true);
        Keyboard.dismiss();
    };

    const toggleFilter = (filter: string) => {
        setActiveFilters(prev =>
            prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]
        );
    };

    const clearFilters = () => setActiveFilters([]);

    const formatEventTime = (date: Date) =>
        new Date(date).toLocaleDateString('en-US', {
            weekday: 'short',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });

    const getCompatibilityColor = (score: number) => {
        if (score >= 90) return '#22c55e';
        if (score >= 80) return '#eab308';
        return '#a855f7';
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Search</Text>

                {/* Search Input */}
                <View style={styles.searchContainer}>
                    <SearchIcon size={20} style={styles.searchIcon} />
                    <TextInput
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={() => handleSearch(searchQuery)}
                        placeholder="Search events, venues, or interests..."
                        style={styles.searchInput}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity
                            onPress={() => {
                                setSearchQuery('');
                                setSearchStarted(false);
                            }}
                            style={styles.clearButton}
                        >
                            <XIcon size={18} color="#6b7280" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Active Filters */}
                {activeFilters.length > 0 && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={styles.badgeRow}>
                            {activeFilters.map((filter) => (
                                // <Badge 
                                //     key={filter} 
                                //     onPress={() => toggleFilter(filter)} 
                                //     label={filter} 
                                //     removable 
                                // />

                                <Badge
                                    key={filter}
                                    onPress={() => toggleFilter(filter)}
                                    removable
                                >
                                    {filter}
                                </Badge>

                            ))}
                            <ButtonUpdate onPress={clearFilters} title="Clear all" variant="ghost" />
                        </View>
                    </ScrollView>
                )}
            </View>

            <Tabs selected={tab} onTabChange={(val: string) => setTab(val as 'events' | 'categories' | 'filters')}>
                <TabsList>
                    <Tab label="Events" value="events" />
                    <Tab label="Categories" value="categories" />
                    <Tab label="Filters" value="filters" />
                </TabsList>

                <TabsContent value="events" activeTab={tab}>
                    <Text>...</Text>
                </TabsContent>
                <TabsContent value="categories" activeTab={tab}>
                    <Text>...</Text>
                </TabsContent>
                <TabsContent value="filters" activeTab={tab}>
                    <Text>...</Text>
                </TabsContent>


            </Tabs>

            {/* Tab Content */}
            <View style={{ flex: 1 }}>
                {tab === 'events' && (
                    <ScrollView contentContainerStyle={{ padding: 16 }}>
                        {!searchStarted && !searchQuery ? (
                            <>
                                <Text style={styles.sectionTitle}>Trending Searches</Text>
                                {TRENDING_SEARCHES.map((trend) => (
                                    <TouchableOpacity
                                        key={trend}
                                        onPress={() => handleSearch(trend)}
                                        style={styles.trendingItem}
                                    >
                                        <SearchIcon size={18} color="#9ca3af" />
                                        <Text style={styles.trendingText}>{trend}</Text>
                                    </TouchableOpacity>
                                ))}

                                <Text style={styles.sectionTitle}>Quick Filters</Text>
                                <View style={styles.badgeRow}>
                                    {['Tonight', 'This Weekend', 'Free Events', 'Nearby'].map((item) => (
                                        // <Badge key={item} label={item} onPress={() => toggleFilter(item)} />
                                        <Badge key={item} onPress={() => toggleFilter(item)}>
                                            {item}
                                        </Badge>
                                    ))}
                                </View>
                            </>
                        ) : isLoading ? (
                            <LoadingSpinner size="lg" />
                        ) : searchResults?.length > 0 ? (
                            searchResults.map((event) => {
                                const score = Math.floor(Math.random() * 20) + 80;
                                return (
                                    <TouchableOpacity
                                        key={event.id}
                                        // onPress={() => navigation.navigate('EventDetail', { id: event.id } )}
                                        style={styles.eventCard}
                                    >
                                        <View style={styles.eventRow}>
                                            <Image
                                                source={{ uri: event.imageUrl || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=80' }}
                                                style={styles.eventImage}
                                            />
                                            <View style={{ flex: 1 }}>
                                                <View style={styles.eventTitleRow}>
                                                    <Text style={styles.eventTitle}>{event.title}</Text>
                                                    <View
                                                        style={[
                                                            styles.compatibilityBadge,
                                                            { backgroundColor: getCompatibilityColor(score) },
                                                        ]}
                                                    >
                                                        <Text style={{ color: '#fff', fontSize: 12 }}>{score}%</Text>
                                                    </View>
                                                </View>
                                                <View style={styles.eventMetaRow}>
                                                    <ClockIcon size={14} color="#9ca3af" />
                                                    <Text style={styles.eventMetaText}>{formatEventTime(event.startTime)}</Text>
                                                    {event.location?.venue && (
                                                        <>
                                                            <MapPinIcon size={14} color="#9ca3af" style={{ marginLeft: 12 }} />
                                                            <Text style={styles.eventMetaText}>{event.location.venue}</Text>
                                                        </>
                                                    )}
                                                </View>
                                                <Text numberOfLines={2} style={styles.eventDescription}>
                                                    {event.description}
                                                </Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })
                        ) : (
                            <View style={styles.noResults}>
                                <SearchIcon size={48} color="#9ca3af" />
                                <Text style={styles.noResultsText}>No events found</Text>
                                <Text style={styles.noResultsSubText}>
                                    Try searching with different keywords or adjust your filters.
                                </Text>
                            </View>
                        )}
                    </ScrollView>
                )}

                {tab === 'categories' && (
                    <ScrollView contentContainerStyle={{ padding: 16 }}>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                            {EVENT_CATEGORIES.map((cat) => (
                                <TouchableOpacity
                                    key={cat}
                                    onPress={() => handleSearch(cat)}
                                    style={styles.categoryCard}
                                >
                                    <Text style={styles.categoryEmoji}>
                                        {cat === 'Music' && '🎵'}
                                        {cat === 'Food & Drink' && '🍽️'}
                                        {cat === 'Nightlife' && '🌙'}
                                        {cat === 'Arts & Culture' && '🎨'}
                                        {cat === 'Sports & Fitness' && '🏃‍♂️'}
                                        {cat === 'Outdoor' && '🌲'}
                                        {cat === 'Social' && '👥'}
                                        {cat === 'Networking' && '🤝'}
                                    </Text>
                                    <Text style={styles.categoryLabel}>{cat}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>
                )}

                {tab === 'filters' && (
                    <ScrollView contentContainerStyle={{ padding: 16 }}>
                        <Text style={styles.sectionTitle}>When</Text>
                        <View style={styles.badgeRow}>
                            {['Today', 'Tomorrow', 'This Week', 'This Month', 'Next Month'].map((t) => (
                                <Badge key={t} onPress={() => toggleFilter(t)} selected={activeFilters.includes(t)}>
                                    {t}
                                </Badge>
                            ))}
                        </View>

                        <Text style={styles.sectionTitle}>Distance</Text>
                        <View style={styles.badgeRow}>
                            {['1 mile', '5 miles', '10 miles', '25 miles', '50 miles', 'Any distance'].map((d) => (
                                <Badge key={d} onPress={() => toggleFilter(d)} selected={activeFilters.includes(d)}>
                                    {d}
                                </Badge>

                            ))}
                        </View>

                        <Text style={styles.sectionTitle}>Price</Text>
                        <View style={styles.badgeRow}>
                            {['Free', 'Under $20', '$20-$50', 'Over $50'].map((p) => (
                                <Badge key={p} onPress={() => toggleFilter(p)} selected={activeFilters.includes(p)}>
                                    {p}
                                </Badge>
                            ))}
                        </View>
                    </ScrollView>
                )}
            </View>

            {/* Floating Action Button */}
            <TouchableOpacity onPress={() => { }} style={styles.fab}>
                <PlusIcon size={28} color="#fff" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { padding: 16, borderBottomWidth: 1, borderColor: '#e5e7eb' },
    headerTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
    searchContainer: { position: 'relative', marginBottom: 12 },
    searchInput: {
        height: 48,
        paddingLeft: 40,
        paddingRight: 40,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        fontSize: 16,
        backgroundColor: '#f9fafb',
    },
    searchIcon: { position: 'absolute', left: 12, top: 18, color: '#9ca3af' },
    clearButton: { position: 'absolute', right: 12, top: 14 },
    badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
    sectionTitle: { fontWeight: '600', marginVertical: 12 },
    trendingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        backgroundColor: '#f3f4f6',
        marginBottom: 8,
    },
    trendingText: { marginLeft: 8, fontWeight: '500' },
    eventCard: {
        backgroundColor: '#f9fafb',
        borderRadius: 16,
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    eventRow: { flexDirection: 'row' },
    eventImage: { width: 64, height: 64, borderRadius: 12, marginRight: 12 },
    eventTitleRow: { flexDirection: 'row', justifyContent: 'space-between' },
    eventTitle: { fontWeight: '600', flexShrink: 1 },
    compatibilityBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
    eventMetaRow: { flexDirection: 'row', marginVertical: 4, alignItems: 'center' },
    eventMetaText: { marginLeft: 4, fontSize: 12, color: '#6b7280' },
    eventDescription: { fontSize: 12, color: '#6b7280' },
    noResults: { alignItems: 'center', marginTop: 48 },
    noResultsText: { fontWeight: '600', marginTop: 12 },
    noResultsSubText: { color: '#6b7280', fontSize: 13, marginTop: 4, textAlign: 'center' },
    categoryCard: {
        width: '48%',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        alignItems: 'center',
        marginBottom: 12,
    },
    categoryEmoji: { fontSize: 24 },
    categoryLabel: { fontWeight: '500', marginTop: 6 },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#22c55e',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 6,
    },
});
