# MotionManga AI - Troubleshooting Guide

## Quick Fixes

### Issue 1: Cannot Add Spaces in Story Idea Field

**If you cannot type spaces in the story idea textarea, try these solutions:**

1. **Browser Console Check**
   - Open browser DevTools (F12 or Right Click > Inspect)
   - Go to the Console tab
   - Type your story idea and watch for any console messages
   - You should see `[MotionManga]` messages logging your input

2. **Browser-Specific Issues**
   - Try a different browser (Chrome, Firefox, Safari, Edge)
   - Disable browser extensions temporarily
   - Clear browser cache and reload

3. **Keyboard/Input Method**
   - Try using the spacebar key
   - Try copy-pasting text with spaces from another application
   - Check if your keyboard layout is correct
   - Disable any keyboard shortcuts that might intercept spaces

4. **System-Level Issues**
   - Check if other applications allow space input
   - Restart your browser
   - Restart your computer if needed

### Issue 2: Cannot Access MiniMax API Key / Authentication Errors

**If you're getting API key errors, follow these steps:**

#### Step 1: Verify Your API Key

1. **Check the .env file**
   ```bash
   cat .env
   ```

   You should see:
   ```
   NEXT_PUBLIC_MINIMAX_API_KEY=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

2. **Verify the API key format**
   - MiniMax API keys are JWT tokens starting with `eyJ`
   - They are very long (usually 500+ characters)
   - No spaces or line breaks in the key

#### Step 2: Restart the Development Server

**CRITICAL: Environment variables are only loaded when the server starts!**

1. Stop the current dev server (Ctrl+C or Cmd+C)
2. Start it again:
   ```bash
   npm run dev
   ```

#### Step 3: Check Browser Console

1. Open your browser DevTools (F12)
2. Go to Console tab
3. Look for this message on page load:
   ```
   [MotionManga] ✓ API key is configured correctly
   ```

4. If you see an error or warning, the API key is not loaded

#### Step 4: Visual Indicators

- **Red Warning Banner**: If you see a red banner at the top saying "API Key Not Configured", your API key is missing or not loaded
- **Toast Notification**: You'll see a toast error message if the API key is not configured

#### Step 5: Test the API Connection

1. Enter any story idea (with or without spaces)
2. Click "Generate Comic Script"
3. Check the error message:
   - "Authentication failed" (Error 1004) = Invalid API key
   - "API key not provided" = Environment variable not loaded
   - "Insufficient balance" (Error 1008) = Valid key, but no credits

## Common Error Messages

### Error 1004: Authentication Failed
**Cause**: Invalid or incorrect API key

**Solution**:
1. Go to https://platform.minimax.io
2. Log in to your account
3. Get a new API key
4. Replace the entire key in your `.env` file
5. Restart the dev server

### Error 1008: Insufficient Balance
**Cause**: Your MiniMax account has no credits

**Solution**:
1. Visit https://platform.minimax.io/user-center/payment/balance
2. Add funds to your account
3. Try again

### "API key not provided"
**Cause**: The NEXT_PUBLIC_MINIMAX_API_KEY environment variable is not loaded

**Solution**:
1. Verify the `.env` file exists in the project root
2. Verify the variable name is exactly: `NEXT_PUBLIC_MINIMAX_API_KEY`
3. Verify there are no spaces around the `=` sign
4. **Restart the development server**

### "Configuration error"
**Cause**: One or more environment variables are missing

**Solution**:
1. Check all three required variables are in `.env`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_MINIMAX_API_KEY`
2. Restart the development server

## Environment Variable Best Practices

### ✅ Correct Format
```bash
NEXT_PUBLIC_MINIMAX_API_KEY=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

### ❌ Wrong Formats
```bash
# No quotes needed
NEXT_PUBLIC_MINIMAX_API_KEY="eyJhbGci..."

# No spaces
NEXT_PUBLIC_MINIMAX_API_KEY = eyJhbGci...

# Must be on one line
NEXT_PUBLIC_MINIMAX_API_KEY=eyJhbGci
...more text...

# Don't add comments on the same line
NEXT_PUBLIC_MINIMAX_API_KEY=eyJhbGci... # my key
```

## Debug Checklist

Use this checklist to systematically debug issues:

- [ ] `.env` file exists in project root
- [ ] All three environment variables are set
- [ ] API key is the complete JWT token (starts with `eyJ`)
- [ ] No quotes around the API key value
- [ ] No spaces around the `=` sign
- [ ] Development server was restarted after changing `.env`
- [ ] Browser console shows "✓ API key is configured correctly"
- [ ] No red warning banner on the page
- [ ] Can type text in other applications (to rule out keyboard issues)
- [ ] Tried a different browser
- [ ] MiniMax account has sufficient balance

## Advanced Debugging

### Check Environment Variables in Browser Console

Open browser console and run:
```javascript
console.log({
  supabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
  anon: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  minimax: !!process.env.NEXT_PUBLIC_MINIMAX_API_KEY,
});
```

All three should show `true`.

### Test Textarea Input

Open browser console and run:
```javascript
document.querySelector('textarea').addEventListener('input', (e) => {
  console.log('Input:', e.target.value);
});
```

Type in the textarea and watch for console logs.

## Still Having Issues?

1. **Check the browser console** for detailed error messages
2. **Try the example story**: "A robot discovers emotions for the first time"
3. **Verify your MiniMax account** at https://platform.minimax.io
4. **Check the edge function logs** in your Supabase dashboard

## Updated API Endpoints

The application now uses the correct MiniMax API endpoints:
- Script: `https://api.minimax.io/v1/text/chatcompletion_v2`
- Image: `https://api.minimax.io/v1/image/generation`
- Speech: `https://api.minimax.io/v1/t2a_v2`
- Video: `https://api.minimax.io/v1/video/generation`

All domains have been updated in `next.config.js`.
