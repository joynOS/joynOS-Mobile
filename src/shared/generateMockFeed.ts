import type { Event } from './shared';

const categories = [
  'Nightlife',
  'Music',
  'Food & Drink',
  'Arts & Culture',
  'Sports & Fitness',
  'Outdoor',
  'Social',
  'Networking',
];

const venues = [
  'Sky Lounge',
  'Blue Note Jazz Club',
  'Riverside Park',
  'Innovation Hub',
  'The Landmark Theater',
  'Washington Square Park',
  'Community Center',
  'The Rooftop Garden',
  'The Comedy Cellar',
  'Central Park Great Lawn',
];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomTitle(category: string): string {
  const titleMap: Record<string, string[]> = {
    'Nightlife': ['Sunset Rooftop Vibes', 'Late Night Lounge', 'Electro Night Session'],
    'Music': ['Jazz Night Live', 'Indie Jam Session', 'Acoustic Evening'],
    'Food & Drink': ['Rooftop Brunch & Mimosas', 'Street Food Crawl', 'Wine & Cheese Social'],
    'Arts & Culture': ['Gallery Night Walk', 'Open Studio Tour', 'Poetry in the Park'],
    'Sports & Fitness': ['Morning Yoga Flow', 'Sunrise Run Club', 'HIIT in the Square'],
    'Outdoor': ['Hiking Adventure', 'Picnic Meetup', 'Stargazing Night'],
    'Social': ['Board Game Night', 'Trivia at the Pub', 'Community Potluck'],
    'Networking': ['Tech Networking Mixer', 'Founder Coffee Chat', 'Pitch & Pizza'],
  };
  const list = titleMap[category] || ['Joyn Meetup'];
  return randomFrom(list);
}

export function generateMockEvents(count: number, startId = 1000): Event[] {
  const now = Date.now();
  const events: Event[] = [];

  for (let i = 0; i < count; i++) {
    const id = startId + i;
    const category = randomFrom(categories);
    const startOffsetHours = Math.floor(Math.random() * 24 * 14) - 24;
    const durationHours = Math.floor(Math.random() * 4) + 2;
    const startTime = new Date(now + startOffsetHours * 60 * 60 * 1000);
    const endTime = new Date(startTime.getTime() + durationHours * 60 * 60 * 1000);

    const imageSeed = 1492684223066 + id;

    events.push({
      id,
      title: randomTitle(category),
      description: 'Curated by Joyn OS — AI‑generated plan options and lobby chat included.',
      imageUrl: `https://images.unsplash.com/photo-${imageSeed}?w=800&h=1200&fit=crop`,
      location: {
        lat: 40.7128 + Math.random() * 0.1 - 0.05,
        lng: -74.0060 + Math.random() * 0.1 - 0.05,
        venue: randomFrom(venues),
        address: 'New York, NY',
      },
      startTime,
      endTime,
      maxAttendees: 30 + Math.floor(Math.random() * 40),
      currentAttendees: 5 + Math.floor(Math.random() * 20),
      category,
      tags: ['MVP', 'NYC', 'Joyn'],
      aiVibeAnalysis: null,
      createdBy: null,
      createdAt: new Date(now - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000),
    });
  }

  return events;
}
