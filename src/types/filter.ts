export interface FilterOptions {
  category?: string;
  distance?: number;
  timeframe?: 'today' | 'this_week' | 'this_month';
  interests?: string[];
}
