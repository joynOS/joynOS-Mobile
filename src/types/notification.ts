export interface NotificationData {
    type: 'quorum' | 'vote' | 'commit' | 'event_start';
    title: string;
    message: string;
    eventId?: number;
}
