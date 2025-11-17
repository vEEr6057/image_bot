# Image Enhancement Telegram Bot

A private Telegram bot for AI-powered image super-resolution and color grading using Real-ESRGAN and OpenCV.

## Features

- 🚀 **AI Super-Resolution**: Upscale images 2×/4× using Real-ESRGAN
- 🎨 **Color Grading**: Apply cinematic color presets
- 🔒 **Private**: User ID restriction for authorized access only
- 🖼️ **GPU Accelerated**: CUDA support for fast processing
- 💾 **Memory Efficient**: Tile-based processing for large images
- 📱 **Easy to Use**: Simple Telegram interface

## Setup

### 1. Prerequisites

- Python 3.8+
- NVIDIA GPU (optional, but recommended for faster processing)
- CUDA Toolkit (if using GPU)
- Telegram Bot Token (from [@BotFather](https://t.me/botfather))

### 2. Installation

```bash
# Clone the repository
cd image_bot

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Configuration

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` with your settings:
```env
# Get your bot token from @BotFather
BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz

# Add your Telegram user ID(s)
# Find your ID by messaging @userinfobot
ADMIN_IDS=123456789,987654321

# Model configuration (optional)
MODEL_NAME=RealESRGAN_x4plus
MODEL_SCALE=4
TILE_SIZE=512

# Performance options
USE_FP16=true
USE_GPU=true
```

### 4. Download Model Weights

The bot will automatically download the model on first run. Or manually download:

```bash
# Create weights directory
mkdir -p weights

# Download RealESRGAN x4plus model (general purpose)
curl -L https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus.pth -o weights/RealESRGAN_x4plus.pth

# OR download anime model (for anime/cartoon images)
curl -L https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus_anime_6B.pth -o weights/RealESRGAN_x4plus_anime_6B.pth
```

### 5. Run the Bot

```bash
python main.py
```

## Usage

### Basic Upscaling

1. Start the bot: `/start`
2. Send an image (as photo, not file)
3. Wait for processing
4. Receive upscaled image (4× resolution)

### With Color Grading

1. Send an image
2. After upscaling completes, reply with a preset name
3. Receive color-graded image

### Available Commands

- `/start` - Show welcome message
- `/help` - Detailed usage instructions
- `/presets` - List all color grading presets
- `/cancel` - Cancel current operation

### Color Presets

**Photographic Styles:**
- `warm` - Warm tones, cozy feeling
- `cool` - Cool tones, modern look
- `vibrant` - Enhanced saturation and sharpness
- `cinematic` - Film-like with vignette effect
- `vintage` - Retro, desaturated look

**Colormap Styles:**
- `magma` - Dark purple to yellow gradient
- `plasma` - Purple to yellow gradient
- `viridis` - Blue to yellow (scientific visualization)
- `turbo` - Rainbow-like colorful mapping

## Project Structure

```
image_bot/
├── main.py                 # Entry point
├── requirements.txt        # Python dependencies
├── .env.example           # Example configuration
├── .gitignore             # Git ignore rules
├── README.md              # This file
├── src/
│   ├── bot.py            # Main bot logic
│   ├── config.py         # Configuration management
│   ├── super_resolution.py  # Real-ESRGAN integration
│   ├── color_grading.py  # Color grading effects
│   └── utils.py          # Utility functions
├── weights/               # Model weights (auto-downloaded)
└── temp/                  # Temporary image files
```

## Advanced Configuration

### Using Different Models

Edit `.env` to use different models:

```env
# For anime/cartoon images
MODEL_NAME=RealESRGAN_x4plus_anime_6B

# For 2× upscaling (faster)
MODEL_NAME=RealESRGAN_x2plus
MODEL_SCALE=2
```

### GPU Memory Issues

If you encounter CUDA out of memory errors:

```env
# Reduce tile size
TILE_SIZE=256

# Or disable FP16
USE_FP16=false
```

### CPU-Only Mode

```env
USE_GPU=false
```

## Optimization Tips

### Speed Optimization

1. **Use GPU**: 10-20× faster than CPU
2. **Enable FP16**: 2× faster on modern GPUs
3. **Adjust tile size**: Larger tiles = faster (if memory allows)
4. **Use x2 model**: Faster than x4, good for moderate upscaling

### Quality vs Speed

- **Best Quality**: `RealESRGAN_x4plus` + `TILE_SIZE=1024` + GPU
- **Balanced**: `RealESRGAN_x4plus` + `TILE_SIZE=512` + GPU + FP16
- **Fastest**: `RealESRGAN_x2plus` + `TILE_SIZE=256` + GPU + FP16

## Troubleshooting

### Bot doesn't respond

1. Check bot token is correct
2. Verify your user ID is in `ADMIN_IDS`
3. Check bot is running: `python main.py`

### "Out of memory" error

1. Reduce `TILE_SIZE` in `.env`
2. Disable FP16: `USE_FP16=false`
3. Use CPU mode: `USE_GPU=false`

### Model download fails

Manually download from [Real-ESRGAN releases](https://github.com/xinntao/Real-ESRGAN/releases/tag/v0.1.0) and place in `weights/` directory.

### Image quality issues

- For photos: Use `RealESRGAN_x4plus`
- For anime/cartoons: Use `RealESRGAN_x4plus_anime_6B`
- Increase tile size for better quality
- Try different color presets

## Security Notes

- **Keep `.env` private**: Never commit it to Git
- **Restrict access**: Only add trusted user IDs to `ADMIN_IDS`
- **Run locally**: For maximum privacy, run on your own machine
- **Firewall**: If deploying to cloud, restrict access

## Deployment

### Local/Home Server

Simply run `python main.py` on your machine. The bot uses polling (no webhook needed).

### Cloud Deployment (AWS/GCP/Azure)

1. Use GPU instance (e.g., AWS G4, GCP A100)
2. Clone repository and setup environment
3. Use systemd/supervisor to keep bot running
4. Optional: Use Docker for easier deployment

### Docker (Optional)

```dockerfile
FROM pytorch/pytorch:2.0.0-cuda11.7-cudnn8-runtime

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
CMD ["python", "main.py"]
```

## Performance Benchmarks

Approximate processing times (512×512 → 2048×2048):

| Hardware | Model | Time |
|----------|-------|------|
| RTX 3080 | x4plus FP16 | ~3s |
| RTX 3080 | x4plus FP32 | ~5s |
| RTX 2060 | x4plus FP16 | ~6s |
| CPU i7 | x4plus | ~40s |

## Credits

- [Real-ESRGAN](https://github.com/xinntao/Real-ESRGAN) - Super-resolution model
- [BasicSR](https://github.com/XPixelGroup/BasicSR) - Image restoration framework
- [python-telegram-bot](https://github.com/python-telegram-bot/python-telegram-bot) - Telegram Bot API

## License

This project is for personal/educational use. Model weights have their own licenses:
- Real-ESRGAN: [BSD 3-Clause License](https://github.com/xinntao/Real-ESRGAN/blob/master/LICENSE)

## Contributing

This is a private bot template. Feel free to fork and customize for your needs!

## Support

For issues with:
- **Real-ESRGAN model**: See [official repo](https://github.com/xinntao/Real-ESRGAN)
- **Telegram Bot API**: See [python-telegram-bot docs](https://docs.python-telegram-bot.org/)
- **This bot**: Check troubleshooting section above

## Future Enhancements

Possible additions:
- Neural style transfer integration
- Batch processing support
- Web interface (Flask/FastAPI)
- Face enhancement (GFPGAN)
- Custom training on your dataset
- Video processing support

---

**Enjoy your enhanced images! 🎨✨**
