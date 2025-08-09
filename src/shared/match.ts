import type { Event } from './shared';

export function computeMatchScore(event: Event): number {
  const base = 80;
  const tagBoost = Math.min(10, (event.tags?.length || 0) * 2);
  const categoryBoost = event.category === 'Nightlife' ? 3 : event.category === 'Music' ? 2 : 0;
  const attendeesBoost = Math.min(5, Math.floor((event.currentAttendees || 0) / 10));
  const score = base + tagBoost + categoryBoost + attendeesBoost;
  return Math.max(60, Math.min(99, Math.round(score)));
}
