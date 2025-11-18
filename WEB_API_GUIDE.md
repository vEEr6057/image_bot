# Web UI Backend Connection Guide

## Setup Steps (5 minutes)

### 1. Open Google Colab API Notebook
- Open `colab_api_setup.ipynb` in Google Colab
- Or use: https://colab.research.google.com/github/vEEr6057/image_bot/blob/main/colab_api_setup.ipynb

### 2. Get ngrok Token (Free)
1. Go to https://dashboard.ngrok.com/signup
2. Sign up (free account)
3. Copy your authtoken from https://dashboard.ngrok.com/get-started/your-authtoken

### 3. Run the Colab Notebook
1. Runtime > Change runtime type > T4 GPU
2. Run all cells in order
3. Paste your ngrok token when prompted
4. Wait for "API SERVER IS RUNNING!" message
5. Copy the public URL (e.g., `https://abc123.ngrok-free.app`)

### 4. Configure Web UI
Create or edit `web-ui/.env.local`:

```bash
NEXT_PUBLIC_BACKEND_BASE_URL=https://YOUR-NGROK-URL.ngrok-free.app
```

Replace `YOUR-NGROK-URL` with the URL from step 3.

### 5. Restart Web UI
```bash
cd web-ui
npm run dev
```

## How It Works

```
User Browser → Next.js (Vercel) → ngrok Tunnel → Colab GPU → Real-ESRGAN
```

1. User uploads image in browser
2. Next.js sends to ngrok URL
3. ngrok tunnels to Colab
4. Colab processes with GPU
5. Returns enhanced image
6. Browser receives result

## Architecture

### Before (No Backend):
- Upload → Placeholder returns original image

### After (With Colab Backend):
- Upload → ngrok → Colab GPU → Real-ESRGAN → Enhanced 4× image

## Limitations

- **Colab runtime**: 12 hours max (free tier)
- **Idle timeout**: 90 minutes
- **Solution**: Just restart the notebook when it disconnects

## Testing

1. Health check: `https://YOUR-URL.ngrok-free.app/health`
2. Should return: `{"status": "healthy", "gpu_available": true}`

## Local Testing (Without Colab)

If you want to test locally without Colab:

```bash
# Install dependencies
pip install -r requirements.txt
pip install -r requirements-api.txt

# Run API server
python api_server.py
```

Then use `http://localhost:5000` as your backend URL.

## Troubleshooting

### ngrok URL not working
- Check Colab is still running
- Verify URL was copied correctly
- Try the /health endpoint first

### "Upload failed" error
- Check NEXT_PUBLIC_BACKEND_BASE_URL in .env.local
- Verify ngrok tunnel is active in Colab
- Check Colab cell output for errors

### Slow processing
- Verify GPU is enabled (Runtime > Change runtime type)
- Check Colab output for "GPU: Tesla T4"
- Should take 5-10 seconds per image

## Production Deployment

For 24/7 availability, consider:
1. **Railway.app** - Deploy Flask API ($5/month)
2. **Render.com** - Free tier (sleeps after 15 min)
3. **Google Cloud Run** - Pay per request
4. **Colab Pro** - 24-hour runtimes ($10/month)
