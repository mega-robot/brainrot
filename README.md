# 🧠 BrainRot

> *Break the doomscrolling cycle. Reclaim your digital freedom.*

A revolutionary React Native mobile application that uses AI, gamification, and community support to help users overcome digital addiction and develop healthier social media habits.


## ✨ What Makes BrainRot Different

Unlike traditional "digital detox" apps that simply block content, BrainRot takes a holistic approach:

- **🤖 AI-Powered Detection**: Smart algorithms identify doomscrolling patterns before they start
- **👥 Community Squads**: Join accountability groups for mutual support
- **🎮 Gamification**: Earn tokens and unlock rewards for healthy habits
- **🧠 Personalized Interventions**: AI-tailored strategies based on your behavior
- **🌐 Web3 Integration**: Decentralized identity and community governance

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Expo CLI
- Android Studio (for Android dev)
- Xcode (for iOS dev, macOS only)

### Installation
```bash
# Clone the repository
git clone <your-repo-url>
cd brainrot

# Install dependencies
npm install

# Start the development server
npm start
```

### Running on Devices
```bash
# Android emulator/device
npm run android

# iOS simulator/device (macOS only)
npm run ios

# Web browser
npm run web
```

## 📱 App Features

### Core Screens
| Screen | Icon | Description |
|--------|------|-------------|
| **Hub** | 🧠 | Central dashboard with activity overview and quick actions |
| **Squads** | 👥 | Create or join community groups for accountability |
| **Forum** | 🌐 | Q&A community for support and discussions |
| **Prizes** | 🎁 | Rewards system with token-based achievements |
| **Vent** | 💭 | Safe space for reflection and emotional processing |
| **Profile** | 👻 | Web3 identity, stats, and personal achievements |

### Special Features
- **Focus Sessions**: Guided meditation and productivity sessions
- **Intervention System**: Real-time AI interventions during risky behavior
- **Token Economy**: Earn, trade, and spend tokens within the ecosystem
- **Doomscrolling Detection**: Native Android module for pattern recognition

## 🏗️ Architecture

```
brainrot/
├── 📱 App.js                 # Main navigation & app structure
├── ⚙️ app.json              # Expo configuration
├── 📦 package.json          # Dependencies & scripts
├── 🚀 index.js              # App entry point
├── 🎨 assets/               # Static assets & media
├── 🧩 src/
│   ├── 🧱 components/       # Reusable UI components
│   │   ├── BrainCharacter.js    # Animated brain mascot
│   │   └── KawaiiAlert.js       # Cute notification alerts
│   ├── 📊 context/          # Global state management
│   │   ├── AlertContext.js      # Alert system state
│   │   └── TokenContext.js      # Token economy state
│   ├── 📱 native/           # Platform-specific modules
│   │   └── DoomscrollingDetector.js
│   ├── 📱 screens/          # Main app screens
│   │   ├── HomeScreen.js
│   │   ├── FocusSessionScreen.js
│   │   ├── SquadsScreen.js
│   │   └── [8 more screens...]
│   └── 🎨 theme.js          # Design system & colors
└── 🤖 test_gemini.js        # AI integration testing
```

## 🛠️ Tech Stack

### Frontend
- **React Native 0.81.5** - Cross-platform mobile framework
- **Expo SDK 54** - Development platform and services
- **React Navigation 7** - Navigation and routing
- **Reanimated 4** - Smooth animations and gestures

### AI & Data
- **Google Generative AI** - Personalized interventions and content
- **AsyncStorage** - Local data persistence
- **Context API** - Global state management

### Development
- **TypeScript** - Type safety (planned migration)
- **ESLint** - Code quality and consistency
- **Prettier** - Code formatting

## 🔧 Configuration

### Environment Setup
Create a `.env` file in the root directory:
```env
GOOGLE_AI_API_KEY=your_gemini_api_key_here
EXPO_PUBLIC_API_URL=https://api.brainrot.app
```
