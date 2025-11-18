# AI Image Upscaler - Web UI

Modern Next.js web interface for AI-powered image super-resolution using Real-ESRGAN.

## Features

- 🚀 **4× Upscaling**: Quadruple image resolution using Real-ESRGAN
- 🎨 **Color Grading**: 9 professional presets (Warm, Cool, Cinematic, etc.)
- 🖼️ **Drag & Drop**: Easy file upload interface
- 📊 **Before/After**: Side-by-side comparison view
- 💾 **Download**: Get your upscaled images instantly
- 🌙 **Dark Mode**: Automatic theme detection
- ⚡ **GPU Accelerated**: Fast processing with T4 GPU backend

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.3
- **Styling**: Tailwind CSS 3.4
- **AI Backend**: Real-ESRGAN (Python)

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

## Backend Integration

The API route (`app/api/upscale/route.ts`) is currently a placeholder. To enable actual upscaling:

1. **Deploy Python Backend**: Use Railway, Render, or Google Cloud Run to host the Real-ESRGAN processing service
2. **Update API Route**: Replace the placeholder in `route.ts` with your backend URL
3. **Set Environment Variables**: Add `BACKEND_URL` to your Vercel project

Example backend deployment options:

- **Railway**: Free tier with GPU support
- **Google Cloud Run**: Pay-as-you-go with custom containers
- **Render**: Background workers with GPU

## Deployment to Vercel

### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Manual Deploy

1. Push code to GitHub
2. Import project in Vercel dashboard
3. Configure environment variables (if needed)
4. Deploy

### Environment Variables

```env
BACKEND_URL=https://your-backend-url.com
```

## Project Structure

```
web/
├── app/
│   ├── api/
│   │   └── upscale/
│   │       └── route.ts       # API endpoint
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Home page
├── components/
│   ├── ColorGradingSelector.tsx
│   ├── ImageUploader.tsx
│   └── ResultDisplay.tsx
├── public/                    # Static assets
├── next.config.js
├── tailwind.config.ts
└── package.json
```

## Color Grading Presets

1. **None**: Original colors
2. **Warm**: Cozy & inviting
3. **Cool**: Fresh & calm
4. **Vibrant**: Bold & saturated
5. **Muted**: Soft & subtle
6. **Cinematic**: Teal & orange film look
7. **Vintage**: Nostalgic & faded
8. **Black & White**: Classic monochrome
9. **Sepia**: Warm brown tones
10. **Dramatic**: High contrast & moody

## Contributing

This is a private project. For issues or suggestions, contact the maintainer.

## License

Private - All Rights Reserved
