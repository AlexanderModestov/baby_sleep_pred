# Baby Sleep Tracker & Predictor

A Telegram Mini App to help parents track their baby's sleep patterns and predict optimal nap times using AI.

## Features

- 👶 **Child Management**: Add and manage multiple children profiles
- 😴 **Sleep Tracking**: Track sleep start/end times with quality ratings
- 🔮 **AI Predictions**: Get personalized sleep predictions using Google Gemini AI
- 📱 **Mobile-First**: Optimized for Telegram WebApp on mobile devices
- 🎨 **Beautiful UI**: Soft pastel colors with baby-friendly design

## Tech Stack

- **Frontend**: React with TypeScript, Telegram WebApp SDK
- **Backend**: Node.js with Express
- **Database**: SQLite
- **AI**: Google Gemini API
- **Styling**: CSS with mobile-first responsive design

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Google Gemini API key

### 1. Clone and Install Dependencies

```bash
# Install root dependencies
npm run install:all
```

### 2. Environment Configuration

Copy the environment example files and add your API keys:

```bash
# Copy environment files
cp .env.example .env
cp server/.env.example server/.env
```

Edit both `.env` files and add your Google Gemini API key:

```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
PORT=3001
DB_PATH=./database.sqlite
```

### 3. Development Setup

```bash
# Start both server and client in development mode
npm run dev
```

This will start:
- Backend server on `http://localhost:3001`
- Frontend development server on `http://localhost:3000`

### 4. Production Build

```bash
# Build the frontend
npm run build

# Start production server
npm start
```

## API Endpoints

### User Management
- `POST /api/users` - Create/update user
- `GET /api/users/:telegram_id/children` - Get user's children

### Child Management
- `POST /api/children` - Add new child
- `PUT /api/children/:id` - Update child
- `DELETE /api/children/:id` - Delete child

### Sleep Tracking
- `POST /api/sleep-sessions` - Start sleep session
- `PUT /api/sleep-sessions/:id/end` - End sleep session
- `GET /api/children/:child_id/sleep-sessions` - Get sleep history
- `GET /api/children/:child_id/sleep-sessions/ongoing` - Get current sleep session

### AI Predictions
- `GET /api/children/:child_id/predict-sleep` - Get sleep prediction

## Telegram Bot Integration

To use this as a Telegram Mini App:

1. Create a Telegram Bot via @BotFather
2. Set up a web app URL pointing to your deployed frontend
3. Configure the bot to use your Mini App

## Database Schema

The app uses SQLite with three main tables:
- `users` - Telegram user data
- `children` - Child profiles
- `sleep_sessions` - Sleep tracking records

## Development Notes

- The app includes mock user data for development/testing
- All times are stored in ISO 8601 format (UTC)
- The UI is optimized for mobile devices
- Gemini API provides intelligent sleep predictions based on historical data

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on mobile
5. Submit a pull request

## License

MIT License - see LICENSE file for details