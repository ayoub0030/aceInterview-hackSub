# Eleven Labs Setup Guide

## Overview
This guide explains how to configure Eleven Labs for the AceUp Interview system.

## Step 1: Get Your Eleven Labs API Key

1. Go to [Eleven Labs Dashboard](https://elevenlabs.io/app/settings/api-keys)
2. Sign in to your account
3. Navigate to **Settings** → **API Keys**
4. Copy your API key (starts with `sk_...`)

## Step 2: Create or Get Your Agent ID

1. Go to [Eleven Labs Conversational AI](https://elevenlabs.io/app/conversational-ai)
2. Create a new agent or select an existing one
3. Copy the Agent ID (format: `agent_xxxxxxxxxxxxxxxxxxxxx`)

### Agent Configuration Tips:
- **Voice**: Choose a professional voice suitable for interviews
- **Model**: Use the latest available model for best performance
- **System Prompt**: Configure the agent to act as a system design interviewer
- **Knowledge Base**: Optional - add system design resources if needed

## Step 3: Configure Environment Variables

1. Copy the example file:
   ```bash
   cp frontend/.env.local.example frontend/.env.local
   ```

2. Edit `frontend/.env.local` and add your credentials:
   ```
   VITE_ELEVEN_API_KEY=sk_your_api_key_here
   VITE_ELEVEN_AGENT_ID=agent_your_agent_id_here
   ```

3. **Important**: Never commit `.env.local` to git (already in .gitignore)

## Step 4: Verify Configuration

Start the frontend dev server:
```bash
cd frontend
npm run dev
```

Check the browser console for:
- ✅ No warnings about missing `VITE_ELEVEN_API_KEY`
- ✅ Agent ID logged when starting conversation
- ✅ Microphone access requested

## Troubleshooting

### "Can't hear me" Error
**Causes:**
- API key not configured
- Agent ID invalid or not active
- Microphone permissions denied
- WebRTC connection failed

**Solutions:**
1. Verify API key is correct in `.env.local`
2. Check agent is active in Eleven Labs dashboard
3. Allow microphone permissions in browser
4. Check browser console for detailed error messages

### Microphone Not Detected
1. Check browser microphone permissions
2. Verify microphone is working (test in system settings)
3. Try a different browser
4. Check browser console for WebRTC errors

### Agent Not Responding
1. Verify agent ID is correct
2. Check agent is published/active in Eleven Labs dashboard
3. Check agent has proper voice and model configured
4. Review agent system prompt

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_ELEVEN_API_KEY` | Yes | Your Eleven Labs API key |
| `VITE_ELEVEN_AGENT_ID` | No | Agent ID (falls back to default if not set) |
| `VITE_SUPABASE_URL` | Yes | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |

## Testing the Integration

1. Navigate to an interview: `http://localhost:5173/interview/{assessmentId}`
2. Click "Check Permissions" and allow microphone access
3. Click "Start Interview"
4. Wait for 3-second countdown
5. Speak to the agent - it should respond

## API Key Security

- **Never** commit `.env.local` to git
- **Never** expose API keys in client-side code (already handled)
- Use environment variables for all sensitive data
- Rotate API keys periodically in Eleven Labs dashboard

## Support

- [Eleven Labs Documentation](https://elevenlabs.io/docs)
- [Eleven Labs Support](https://help.elevenlabs.io)
- [React SDK Docs](https://elevenlabs.io/docs/conversational-ai/libraries/react)
