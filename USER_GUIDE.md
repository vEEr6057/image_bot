# Image Enhancement Bot - User Guide

## 🎯 Quick Rules to Remember

### ✅ DO:
1. **Send images as PHOTO** (compressed option in Telegram)
2. **Wait for confirmation** - You'll see "🔄 Processing..."
3. **Be patient** - CPU takes 40-60 seconds per image
4. **Check status** - Use `/status` command anytime
5. **One at a time** - Wait for current image to finish

### ❌ DON'T:
1. **Don't send as FILE** - Always choose "Photo" not "Document"
2. **Don't spam images** - Send one, wait for result
3. **Don't interrupt** - Avoid commands during processing
4. **Don't expect instant results** - This is heavy AI processing!

---

## 📱 How to Send Images Correctly

### In Telegram:
1. Click attachment (📎) icon
2. Choose "Photo" or "Gallery"
3. Select your image
4. **IMPORTANT:** Tap "Send as Photo" (NOT "Send as File")
5. Send!

### Why This Matters:
- **Photo** = Bot processes it ✅
- **File/Document** = Slower processing, may fail ❌

---

## ⏱️ Processing Timeline

### What You'll See:

```
1. You send image
   ↓
2. Bot replies: "🔄 Processing your image..."
   ↓ (10-60 seconds)
3. Bot updates: "🚀 Upscaling image with AI..."
   ↓ (processing happens)
4. Bot updates: "✨ Upscaling complete! Sending..."
   ↓
5. You receive 4× upscaled image!
   ↓
6. Optional: Reply with preset name for color grading
```

### Processing Times:
- **Small image (500×500):** 10-20 seconds
- **Medium image (1000×1000):** 20-40 seconds
- **Large image (2000×2000):** 40-60 seconds
- **With GPU:** 3-10× faster!

---

## 🎨 Using Color Grading

### After Receiving Upscaled Image:

**Option 1: Apply Color Grading**
- Just reply with a preset name
- Examples: `warm`, `cinematic`, `vibrant`
- See all: `/presets`

**Option 2: Skip Color Grading**
- Send another image
- Previous state clears automatically

### Available Presets:

**Photographic:**
- `warm` - Cozy, warm tones
- `cool` - Modern, cool tones
- `vibrant` - Enhanced colors
- `cinematic` - Film-like effect
- `vintage` - Retro look

**Artistic Colormaps:**
- `magma` - Purple to yellow
- `plasma` - Vibrant gradient
- `viridis` - Scientific viz
- `turbo` - Rainbow colors

---

## 🔍 How to Know What's Happening

### Check Processing Status:

**Method 1: Watch Messages**
- Bot sends updates as it processes
- Look for emoji indicators:
  - 🔄 = Starting
  - 🚀 = Processing
  - ✨ = Almost done
  - ✅ = Complete

**Method 2: Use /status Command**
- Shows if image is being processed
- Shows if waiting for color grading
- Shows if ready for new image

**Method 3: Check Terminal (if you're the admin)**
- Logs show: "Photo received from user..."
- Logs show: "Processing image for user..."
- Logs show: "Successfully processed..."

---

## 🛠️ Available Commands

| Command | What It Does |
|---------|-------------|
| `/start` | Show welcome message with rules |
| `/help` | Show this detailed guide |
| `/presets` | List all color grading options |
| `/status` | Check current processing state |
| `/cancel` | Clear queue and start fresh |

---

## ❓ Common Questions

### Q: I sent an image, but nothing happened?
**A:** You probably sent it as "File". Try again as "Photo".

### Q: How long should I wait?
**A:** 10-60 seconds depending on image size and CPU/GPU.

### Q: Can I send multiple images at once?
**A:** No! Send one, wait for result, then send next.

### Q: What if I sent the wrong image?
**A:** Just send the correct image. It will replace the old one.

### Q: What if the bot seems stuck?
**A:** Use `/status` to check state, or `/cancel` to reset.

### Q: Can I use this on mobile?
**A:** Yes! Works perfectly on Telegram mobile apps.

### Q: What image formats are supported?
**A:** JPG, PNG, WebP - any format Telegram supports.

### Q: Is there a size limit?
**A:** Telegram limits: 20 MB or 10000×10000 pixels.

### Q: Does it work on screenshots?
**A:** Yes! Any image works.

### Q: Can I upscale the same image twice?
**A:** Yes, but quality improvements diminish after first upscale.

---

## 🚨 Troubleshooting

### Problem: Bot doesn't respond
**Solutions:**
1. Check if bot is running (admin only)
2. Check your user ID is authorized
3. Try `/start` command
4. Send image as PHOTO not FILE

### Problem: Processing takes forever
**Solutions:**
1. Normal for CPU (40-60 seconds)
2. Use smaller images
3. Check with `/status`
4. Use `/cancel` and retry

### Problem: "Error processing image"
**Solutions:**
1. Try sending as PHOTO not FILE
2. Check image isn't corrupted
3. Try a smaller image
4. Check terminal logs (admin)

### Problem: Got upscaled image, but color grading fails
**Solutions:**
1. Check preset name spelling
2. Use `/presets` to see valid options
3. Try `/cancel` and start over

---

## 💡 Pro Tips

1. **Best Quality:** Send images as PHOTO with "high quality" option
2. **Faster Processing:** Use smaller images (under 1000×1000)
3. **Best Results:** Start with good quality originals
4. **Save Bandwidth:** Bot sends compressed results if needed
5. **Multiple Versions:** Can apply different presets to same image
6. **Batch Processing:** Process one, save, process next (no rush!)

---

## 📊 What the Bot Does

### Super-Resolution (Upscaling):
- Uses Real-ESRGAN AI model
- 4× resolution increase
- Example: 500×500 → 2000×2000
- Adds realistic details
- Reduces blur and artifacts

### Color Grading:
- Professional color adjustments
- Brightness, contrast, saturation
- Cinematic effects
- Artistic colormaps
- Temperature adjustments

---

## 🔐 Privacy & Security

- Bot only processes authorized users
- Images deleted after processing
- No data stored permanently
- Processing happens locally (if self-hosted)
- Secure Telegram API communication

---

## 📞 Need Help?

- Use `/help` in bot for quick guide
- Use `/status` to check current state
- Check this guide for detailed info
- Contact bot admin if issues persist

---

**Enjoy enhancing your images! 🎨✨**
