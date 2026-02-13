# Mobile App

React Native mobile app for tenants and maintenance technicians.

## Tech Stack
- **Framework:** React Native
- **Language:** TypeScript
- **Navigation:** React Navigation
- **UI Library:** React Native Paper
- **State Management:** Redux Toolkit
- **HTTP Client:** React Query (TanStack Query)

## Getting Started

### Prerequisites
- Node.js 18+
- iOS: Xcode 14+ (macOS only)
- Android: Android Studio + JDK 17

### Installation
```bash
cd packages/mobile
npm install
cp .env.example .env
```

### iOS Development
```bash
cd ios
pod install
cd ..
npm run ios
```

### Android Development
```bash
npm run android
```

### Build for Production
```bash
# iOS
npm run build:ios

# Android
npm run build:android
```

## Project Structure
```
mobile/
├── src/
│   ├── components/     # Reusable UI components
│   ├── screens/        # Screen components
│   ├── navigation/     # Stack/tab navigators
│   ├── store/         # Redux store & slices
│   ├── hooks/         # Custom React hooks
│   ├── services/      # API service calls
│   ├── utils/         # Helper functions
│   ├── types/         # TypeScript interfaces
│   └── assets/        # Images, fonts, etc.
├── android/           # Android native code
├── ios/              # iOS native code
└── tests/            # Component tests
```