```ts
export type EmojiType = '❤️' | '😮' | '😂' | '🌍' | '🙏';

export interface ReactionCounts {
  [key: string]: number;
  '❤️': number;
  '😮': number;
  '😂': number;
  '🌍': number;
  '🙏': number;
}

export interface PhotoData {
  id: string;
  imageUrl?: string;
  gradient?: string;
  city: string;
  country: string;
  countryCode: string;
  timeAgo: string;
  reactions: ReactionCounts;
  userReaction: EmojiType | null;
  createdAt: Date;
}

export interface CityData {
  name: string;
  countryCode: string;
  emoji?: string;
  momentCount: number;
  lat: number;
  lng: number;
  timezone?: string;
  activityLevel: 'hot' | 'warm' | 'cool';
}

export interface UserProfile {
  id: string;
  city: string;
  country: string;
  countryCode: string;
  anonymous: boolean;
  streak: number;
  momentsCaptured: number;
  reactionsReceived: number;
  isPremium: boolean;
  joinedDate: Date;
  avatar?: string;
}

export interface NotificationData {
  id: string;
  message: string;
  timestamp: Date;
  icon: string;
}
```
