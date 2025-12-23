# MotionManga AI - Living Comic Creator

Create stunning 4-panel "Living Comics" with AI-powered story generation, character consistency, emotional voice acting, and cinematic animation.

## Features

- **AI Story Scripting**: MiniMax M2 generates complete 4-panel comic scripts from your story ideas
- **Character Consistency**: MiniMax Image-01 with Subject Reference ensures your character looks the same across all panels
- **Emotional Voice Acting**: MiniMax Speech 2.6 brings your characters to life with emotion-synced audio
- **Cinematic Animation**: MiniMax Hailuo 2.3 creates stunning video animations with camera movements

## Getting Started

### 1. Set Up Your MiniMax API Key

Before using the application, you need to set your MiniMax API key:

1. Get your API key from [MiniMax Platform](https://platform.minimax.io)
2. Update the `.env` file with your key:
   ```
   NEXT_PUBLIC_MINIMAX_API_KEY=your-actual-api-key-here
   ```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start creating comics!

## How to Use

### Step 1: The Briefing
- Enter your story idea in the text area
- Click "Generate Comic Script" to let AI create your 4-panel story

### Step 2: Script Review
- Review and edit the generated script for each panel
- Adjust visual prompts, dialogue, emotions, and camera movements
- Click "Approve & Create Comic" when satisfied

### Step 3: Comic Creation Canvas
- Watch as AI generates your comic panels in a 2x2 grid
- Panel 1 is generated first and becomes the "Anchor" for character consistency
- Remaining panels use Panel 1 as a reference to maintain consistent character appearance

### Step 4: Interactive Features
- Hover over completed panels to see action buttons
- Click "Speak" to generate emotional voice acting for that panel
- Click "Animate" to create cinematic video animation (uses 1 video credit)
- Click any panel to view it in full-screen mode

## Credit System

- You start with 3 free video generation credits
- Each video animation uses 1 credit
- Image generation and audio generation are unlimited

## Technical Stack

- **Frontend**: Next.js 13, React, Tailwind CSS, Framer Motion
- **State Management**: Zustand
- **Backend**: Supabase Edge Functions (serverless)
- **Database**: Supabase PostgreSQL
- **AI Services**: MiniMax M2, Image-01, Speech 2.6, Hailuo 2.3

## Architecture

The application uses Supabase Edge Functions to proxy all MiniMax API calls, which:
- Bypasses CORS restrictions
- Keeps API keys secure
- Provides centralized error handling
- Enables better rate limiting and logging

## Database Schema

- **comics**: Stores comic metadata and story ideas
- **panels**: Stores panel data including generated images, videos, and audio
- **user_credits**: Tracks video generation credits
- **generation_logs**: Logs all API operations for debugging

## MiniMax API Integration

All MiniMax API calls are routed through Supabase Edge Functions:

- `minimax-script`: Story script generation
- `minimax-image`: Image generation with subject reference
- `minimax-speech`: Emotional voice generation
- `minimax-animate`: Video animation with camera movements

## Important Notes

- Make sure to replace `your-minimax-api-key-here` in `.env` with your actual API key
- Video generation takes 30-60 seconds per panel
- Keep your API key secure and never commit it to version control
- Check your MiniMax account balance at [platform.minimax.io](https://platform.minimax.io/user-center/payment/balance)

## Common MiniMax Error Codes

- **1004**: Authentication failed - Check your API key
- **1008**: Insufficient balance - Add funds to your MiniMax account
- **1002**: Rate limited - Wait a moment and try again
- **1039**: Prompt too long - Shorten your input

## Support

For issues with the application, please check the browser console for detailed error messages.

For MiniMax API issues, visit [MiniMax Documentation](https://platform.minimax.io/document/introduction).

---

Built with ❤️ using MiniMax AI and Supabase
# ComicGen
