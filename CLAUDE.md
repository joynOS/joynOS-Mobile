# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

JoynOS-Mobile is a React Native social events app built with Expo. Users can discover events, join them, chat with other attendees, and participate in event planning through voting systems.

## Development Commands

### Core Development
- `npm start` or `expo start` - Start the development server
- `npm run android` or `expo start --android` - Run on Android
- `npm run ios` or `expo start --ios` - Run on iOS  
- `npm run web` or `expo start --web` - Run on web

### Build and Deploy
- `eas build` - Build the app using EAS Build
- `eas submit` - Submit to app stores

## Architecture

### Technology Stack
- **Frontend**: React Native with Expo SDK 53
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Navigation**: React Navigation v7 with native stack
- **State Management**: Redux Toolkit for events state
- **Authentication**: Context-based auth with JWT tokens and refresh logic
- **HTTP Client**: Axios with automatic token refresh interceptors
- **Backend**: REST API at localhost:3000

### Key Architecture Patterns

1. **Navigation Structure**: 
   - `PublicNavigator` for unauthenticated users (onboarding flow)
   - `PrivateNavigator` for authenticated users (main app screens)
   - Conditional routing based on auth state and onboarding completion

2. **Authentication Flow**:
   - Phone-based authentication with verification codes
   - JWT access/refresh token pattern with automatic refresh
   - Onboarding requirements checked via user profile flags
   - Located in `src/contexts/AuthContext.tsx` and `src/services/auth.ts`

3. **State Management**:
   - Redux store in `src/shared/store.ts` manages event membership state
   - AuthContext manages user authentication and profile state
   - Event slice tracks joined event IDs for UI state

4. **HTTP Layer** (`src/services/http.ts`):
   - Axios instance with Bearer token injection
   - Automatic token refresh on 401 responses
   - Token storage using AsyncStorage
   - Unauthorized handler for auth context integration

### Directory Structure
- `src/screens/` - Main app screens (Feed, Discovery, Profile, etc.)
- `src/components/` - Reusable UI components
- `src/services/` - API service layers
- `src/contexts/` - React contexts (Auth)
- `src/shared/` - Redux store and shared utilities
- `src/types/` - TypeScript type definitions
- `src/utils/` - Utility functions and constants

### Key Screens
- **Feed**: Main timeline of events 
- **Discovery**: Event discovery and filtering
- **EventDetail**: Event details with chat and voting
- **You**: User profile and settings
- **Map**: Geographic event view

### Services Layer
- `auth.ts` - Authentication operations
- `events.ts` - Event CRUD and membership operations  
- `users.ts` - User profile operations
- `interests.ts` - User interests management
- `quiz.ts` - Personality quiz operations

### Configuration Notes
- Uses Expo's new architecture (`newArchEnabled: true`)
- NativeWind configured for Tailwind styling with custom CSS
- Firebase integration for additional services
- EAS configured for builds and submissions