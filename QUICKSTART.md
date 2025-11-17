# Quick Start Guide

## Get Your Bot Running in 5 Minutes

### Step 1: Get Bot Token
1. Open Telegram and message [@BotFather](https://t.me/botfather)
2. Send `/newbot`
3. Follow instructions to create your bot
4. Copy the bot token (looks like: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`)

### Step 2: Get Your User ID
1. Message [@userinfobot](https://t.me/userinfobot) on Telegram
2. Copy your user ID (a number like: `123456789`)

### Step 3: Setup
```bash
# Install Python dependencies
pip install -r requirements.txt

# Copy and edit configuration
cp .env.example .env
# Edit .env file with your BOT_TOKEN and ADMIN_IDS
```

### Step 4: Run
```bash
python main.py
```

### Step 5: Use
1. Open your bot on Telegram
2. Send `/start`
3. Send an image
4. Get enhanced result!

## Example Configuration (.env)

```env
BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
ADMIN_IDS=123456789
MODEL_NAME=RealESRGAN_x4plus
MODEL_SCALE=4
TILE_SIZE=512
USE_FP16=true
USE_GPU=true
WEIGHTS_DIR=./weights
TEMP_DIR=./temp
```

## Common Issues

**Bot doesn't respond?**
- Check bot token is correct
- Verify user ID is in ADMIN_IDS
- Make sure bot is running

**Out of memory?**
- Reduce TILE_SIZE to 256
- Set USE_GPU=false (slower but works)

**Model not found?**
- Bot will auto-download on first run
- Check internet connection
- Or manually download from GitHub

## Next Steps

- Read full [README.md](README.md) for detailed documentation
- Try different color presets with `/presets`
- Adjust settings in `.env` for better performance
