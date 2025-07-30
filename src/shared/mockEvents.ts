interface Event {
  id: number;
  title: string;
  startTime: Date;
  endTime: Date;
  venue: string;
  imageUrl: string;
  status?: 'attended' | 'attending' | 'interested';
  attendees: number;
  maxAttendees: number;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount?: number;
  category: string;
  vibeScore: number;
  userRating?: number;
  savedAt?: Date;
  likedAt?: Date;
}

export const upcomingEvents: Event[] = [
  // Past Events (4 events)
  {
    id: 100,
    title: 'Wine & Paint Workshop',
    startTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    endTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
    venue: 'Creative Studio',
    imageUrl: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=1200&fit=crop&q=80',
    status: 'attended',
    attendees: 16,
    maxAttendees: 20,
    lastMessage: 'Such a relaxing evening with great company!',
    lastMessageTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
    unreadCount: 0,
    category: 'Arts & Culture',
    vibeScore: 91,
    userRating: 4,
  },
  {
    id: 101,
    title: 'Morning Yoga Flow',
    startTime: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    endTime: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 1.5 * 60 * 60 * 1000),
    venue: 'Riverside Park',
    imageUrl: 'https://images.unsplash.com/photo-1506629905607-c28bfc3e7d0d?w=800&h=1200&fit=crop&q=80',
    status: 'attended',
    attendees: 8,
    maxAttendees: 12,
    lastMessage: 'Perfect way to start the week!',
    lastMessageTime: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000),
    unreadCount: 0,
    category: 'Sports & Fitness',
    vibeScore: 89,
    userRating: 5,
  },
  {
    id: 3,
    title: 'Gallery Night Walk',
    startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
    venue: 'Chelsea Art District',
    imageUrl: 'https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=800&h=1200&fit=crop&q=80',
    status: 'attended',
    attendees: 12,
    maxAttendees: 20,
    lastMessage: 'Thanks for an amazing evening everyone!',
    lastMessageTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
    unreadCount: 0,
    category: 'Arts & Culture',
    vibeScore: 88,
    userRating: 5,
  },
  {
    id: 102,
    title: 'Tech Networking Mixer',
    startTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Yesterday
    endTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
    venue: 'Innovation Hub',
    imageUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&h=1200&fit=crop',
    status: 'attended',
    attendees: 24,
    maxAttendees: 30,
    lastMessage: 'Great connections made tonight!',
    lastMessageTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
    unreadCount: 0,
    category: 'Networking',
    vibeScore: 86,
    userRating: 4,
  },

  // Current/Today's Event (1 event - the reference point)
  {
    id: 1,
    title: 'Sunset Rooftop Vibes',
    startTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now (today)
    endTime: new Date(Date.now() + 6 * 60 * 60 * 1000),
    venue: 'Sky Lounge',
    imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=1200&fit=crop',
    status: 'attending',
    attendees: 8,
    maxAttendees: 30,
    lastMessage: 'Looking forward to meeting everyone! 🌅',
    lastMessageTime: new Date(Date.now() - 30 * 60 * 1000), // 30 mins ago
    unreadCount: 3,
    category: 'Nightlife',
    vibeScore: 92,
  },

  // This Week Events (3 events)
  {
    id: 2,
    title: 'Jazz Night at Blue Note',
    startTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
    endTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
    venue: 'Blue Note Jazz Club',
    imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=1200&fit=crop',
    status: 'interested',
    attendees: 15,
    maxAttendees: 25,
    lastMessage: "Who's excited for some smooth jazz?",
    lastMessageTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    unreadCount: 0,
    category: 'Music',
    vibeScore: 85,
  },
  {
    id: 103,
    title: 'Food Truck Festival',
    startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000),
    venue: 'Washington Square Park',
    imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=1200&fit=crop',
    status: 'attending',
    attendees: 32,
    maxAttendees: 50,
    lastMessage: "Can't wait to try all the amazing food!",
    lastMessageTime: new Date(Date.now() - 4 * 60 * 60 * 1000),
    unreadCount: 1,
    category: 'Food & Drink',
    vibeScore: 79,
  },
  {
    id: 104,
    title: 'Indie Film Screening',
    startTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 2.5 * 60 * 60 * 1000),
    venue: 'The Landmark Theater',
    imageUrl: 'https://images.unsplash.com/photo-1489599433057-3c24db4b3e83?w=800&h=1200&fit=crop',
    status: 'interested',
    attendees: 18,
    maxAttendees: 35,
    lastMessage: 'This film got amazing reviews at Sundance!',
    lastMessageTime: new Date(Date.now() - 6 * 60 * 60 * 1000),
    unreadCount: 0,
    category: 'Arts & Culture',
    vibeScore: 87,
  },

  // This Month Events (4 events)
  {
    id: 105,
    title: 'Hiking Adventure: Bear Mountain',
    startTime: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), // 8 days from now
    endTime: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000),
    venue: 'Bear Mountain State Park',
    imageUrl: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=1200&fit=crop',
    status: 'attending',
    attendees: 14,
    maxAttendees: 20,
    lastMessage: 'Weather looks perfect for hiking!',
    lastMessageTime: new Date(Date.now() - 8 * 60 * 60 * 1000),
    unreadCount: 2,
    category: 'Outdoor',
    vibeScore: 91,
  },
  {
    id: 106,
    title: 'Board Game Night',
    startTime: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // 12 days from now
    endTime: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
    venue: 'Community Center',
    imageUrl: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=800&h=1200&fit=crop',
    status: 'interested',
    attendees: 9,
    maxAttendees: 16,
    lastMessage: 'Bringing some new strategy games to try!',
    lastMessageTime: new Date(Date.now() - 12 * 60 * 60 * 1000),
    unreadCount: 0,
    category: 'Social',
    vibeScore: 83,
  },
  {
    id: 107,
    title: 'Rooftop Brunch & Mimosas',
    startTime: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000), // 16 days from now
    endTime: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
    venue: 'The Rooftop Garden',
    imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=1200&fit=crop',
    status: 'attending',
    attendees: 22,
    maxAttendees: 28,
    lastMessage: 'Sunday funday vibes! 🥂',
    lastMessageTime: new Date(Date.now() - 18 * 60 * 60 * 1000),
    unreadCount: 1,
    category: 'Food & Drink',
    vibeScore: 88,
  },
  {
    id: 108,
    title: 'Live Comedy Show',
    startTime: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000), // 22 days from now
    endTime: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
    venue: 'The Comedy Cellar',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=1200&fit=crop',
    status: 'interested',
    attendees: 26,
    maxAttendees: 45,
    lastMessage: 'This comedian is hilarious! Don\'t miss it',
    lastMessageTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
    unreadCount: 0,
    category: 'Nightlife',
    vibeScore: 84,
  },

  // Later Events (3 events)
  {
    id: 109,
    title: 'Summer Music Festival',
    startTime: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000), // 35 days from now
    endTime: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000 + 12 * 60 * 60 * 1000),
    venue: 'Central Park Great Lawn',
    imageUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=1200&fit=crop',
    status: 'attending',
    attendees: 156,
    maxAttendees: 500,
    lastMessage: 'Early bird tickets are selling fast!',
    lastMessageTime: new Date(Date.now() - 48 * 60 * 60 * 1000),
    unreadCount: 4,
    category: 'Music',
    vibeScore: 95,
  },
  {
    id: 110,
    title: 'Startup Pitch Competition',
    startTime: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000), // 42 days from now
    endTime: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000),
    venue: 'Tech Hub Auditorium',
    imageUrl: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=1200&fit=crop',
    status: 'interested',
    attendees: 68,
    maxAttendees: 100,
    lastMessage: 'Some incredible startups presenting!',
    lastMessageTime: new Date(Date.now() - 72 * 60 * 60 * 1000),
    unreadCount: 0,
    category: 'Networking',
    vibeScore: 82,
  },
  {
    id: 111,
    title: 'Cooking Class: Italian Cuisine',
    startTime: new Date(Date.now() + 56 * 24 * 60 * 60 * 1000), // 56 days from now
    endTime: new Date(Date.now() + 56 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
    venue: 'Culinary Institute',
    imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=1200&fit=crop',
    status: 'attending',
    attendees: 11,
    maxAttendees: 16,
    lastMessage: 'Making fresh pasta from scratch! 🍝',
    lastMessageTime: new Date(Date.now() - 96 * 60 * 60 * 1000),
    unreadCount: 0,
    category: 'Food & Drink',
    vibeScore: 90,
  },
];

export const savedEvents: Event[] = [
  {
    id: 4,
    title: 'Weekend Food Festival',
    startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
    endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000),
    venue: 'Central Park',
    imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=1200&fit=crop',
    savedAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    attendees: 45,
    maxAttendees: 100,
    category: 'Food & Drink',
    vibeScore: 78,
  },
  {
    id: 5,
    title: 'Morning Yoga in the Park',
    startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
    venue: 'Prospect Park',
    imageUrl: 'https://images.unsplash.com/photo-1506629905607-c28bfc3e7d0d?w=800&h=1200&fit=crop&q=80',
    savedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    attendees: 8,
    maxAttendees: 15,
    category: 'Sports & Fitness',
    vibeScore: 94,
  },
];

export const likedEvents: Event[] = [
  {
    id: 6,
    title: 'Jazz Night at Blue Note',
    startTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
    venue: 'Blue Note',
    imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=1200&fit=crop',
    likedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    attendees: 32,
    maxAttendees: 50,
    category: 'Music',
    vibeScore: 96,
  },
  {
    id: 7,
    title: 'Art Gallery Opening',
    startTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    endTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
    venue: 'Chelsea Galleries',
    imageUrl: 'https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=800&h=1200&fit=crop&q=80',
    likedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    attendees: 15,
    maxAttendees: 40,
    category: 'Arts & Culture',
    vibeScore: 88,
  },
];