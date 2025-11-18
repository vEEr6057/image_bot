# Connecting Web UI to Google Colab Backend

## 🚀 Quick Start (5 minutes)

Your backend is already in this repo! Just need to expose it via ngrok.

### Step 1: Setup Colab API Server

1. **Open the API notebook in Colab:**
   - Upload `colab_api_setup.ipynb` to Google Colab
   - Or open directly: https://colab.research.google.com/github/vEEr6057/image_bot/blob/main/colab_api_setup.ipynb

2. **Enable GPU:**
   - Runtime > Change runtime type > GPU > T4 GPU > Save

3. **Get ngrok token (free):**
   - Sign up: https://dashboard.ngrok.com/signup
   - Copy token: https://dashboard.ngrok.com/get-started/your-authtoken

4. **Run all cells:**
   - Cell 1: Check GPU ✅
   - Cell 2: Clone repo ✅
   - Cell 3: Install packages ✅
   - Cell 4: Configure env ✅
   - Cell 5: Set ngrok token ✅
   - Cell 6: Start server ✅

5. **Copy the ngrok URL:**
   ```
   📡 Public URL: https://abc123-def456.ngrok-free.app
   ```

### Step 2: Configure Web UI

1. **Create `.env.local` file in `web-ui/` folder:**
   ```bash
   cd web-ui
   cp .env.local.example .env.local
   ```

2. **Edit `.env.local` and paste your ngrok URL:**
   ```bash
   NEXT_PUBLIC_BACKEND_BASE_URL=https://YOUR-NGROK-URL.ngrok-free.app
   ```

3. **Restart the dev server:**
   ```bash
   npm run dev
   ```

### Step 3: Test It!

1. Open http://localhost:3000
2. Upload an image
3. Should now take 5-10 seconds (GPU) instead of instant (fake)
4. Image will be ACTUALLY upscaled 4× with Real-ESRGAN! 🎉

## 🔍 How to Verify It's Working

### Check Backend Health:
Open in browser: `https://YOUR-NGROK-URL.ngrok-free.app/health`

Should return:
```json
{
  "status": "healthy",
  "model": "Real-ESRGAN",
  "gpu_available": true
}
```

### Check Browser Console:
Should see:
```
Forwarding to backend: https://xxx.ngrok-free.app/api/upscale
```

### Check Colab Output:
Should see logs:
```
INFO:__main__:Processing image: your-image.jpg
INFO:__main__:Starting upscaling...
INFO:__main__:Upscaling complete. Output size: (4000, 3000)
```

## 📊 What Changed

| Component | Before | After |
|-----------|--------|-------|
| **Backend** | None (placeholder) | Real-ESRGAN on Colab GPU |
| **Processing** | Instant (returns original) | 5-10 seconds (actual AI) |
| **Result** | Original image | 4× upscaled image |
| **Quality** | No change | Real-ESRGAN enhancement |

## 🏗️ Architecture

```
┌─────────────┐
│   Browser   │
│  (Upload)   │
└──────┬──────┘
       │
       ↓ HTTPS
┌─────────────────┐
│   Vercel        │
│   Next.js       │
│   (web-ui)      │
└──────┬──────────┘
       │
       ↓ HTTPS (NEXT_PUBLIC_BACKEND_BASE_URL)
┌─────────────────┐
│    ngrok        │
│  (Free Tunnel)  │
└──────┬──────────┘
       │
       ↓ HTTP
┌─────────────────┐
│  Google Colab   │
│  Flask Server   │
│  api_server.py  │
└──────┬──────────┘
       │
       ↓
┌─────────────────┐
│  Real-ESRGAN    │
│  GPU T4 16GB    │
│  4× Upscaling   │
└─────────────────┘
```

## 📁 Files Added

1. **`api_server.py`** - Flask API wrapper for Real-ESRGAN
2. **`colab_api_setup.ipynb`** - Colab notebook to run the API
3. **`requirements-api.txt`** - Additional Flask dependencies
4. **`WEB_API_GUIDE.md`** - Detailed setup guide
5. **`web-ui/.env.local.example`** - Environment variable template

## ⚙️ Current Status

✅ **Telegram Bot** - Already working on Colab  
✅ **Flask API Server** - Just created  
✅ **Web UI** - Updated to use backend  
✅ **Colab Notebook** - Ready to run  
⏳ **Your Action** - Run the notebook and configure `.env.local`

## 🎮 Next Steps

1. **Start Colab notebook** (get ngrok URL)
2. **Configure web-ui/.env.local** (paste ngrok URL)
3. **Test locally** (npm run dev)
4. **Deploy to Vercel** (with env variable)

## 🌐 Deploying to Production

### Vercel Environment Variable:
1. Go to Vercel Dashboard > Your Project > Settings > Environment Variables
2. Add: `NEXT_PUBLIC_BACKEND_BASE_URL` = `https://YOUR-NGROK-URL.ngrok-free.app`
3. Redeploy

⚠️ **Important**: Free ngrok URLs change when you restart Colab. For permanent URL, consider:
- ngrok paid plan ($8/month) - Fixed domain
- Railway.app ($5/month) - Deploy Flask API
- Render.com (free tier) - Deploy Flask API

## 🐛 Troubleshooting

### Backend not responding:
- Check Colab is still running (12-hour limit)
- Verify ngrok URL is correct
- Test /health endpoint

### Still getting original image:
- Check `.env.local` exists in `web-ui/` folder
- Verify URL format (no trailing slash)
- Restart dev server after changing .env

### "Upload failed" error:
- Check Colab output for errors
- Verify GPU is enabled in Colab
- Check browser console for details

## 💡 Pro Tips

1. **Keep Colab tab open** - Colab stops when inactive
2. **Use Colab Pro** - For 24-hour runtimes ($10/month)
3. **Local testing first** - Before deploying to Vercel
4. **Monitor Colab logs** - See real-time processing

## 🎉 Success Indicators

✅ Colab shows: "API SERVER IS RUNNING!"  
✅ /health returns: `{"gpu_available": true}`  
✅ Browser console: "Forwarding to backend"  
✅ Processing takes 5-10 seconds  
✅ Image is visibly sharper/larger  
