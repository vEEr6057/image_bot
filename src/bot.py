"""
Main Telegram Bot for Image Super-Resolution and Color Grading
"""
import logging
import os
from io import BytesIO
from pathlib import Path
from functools import wraps

from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes
from telegram.constants import ParseMode
from PIL import Image

from .config import Config
from .super_resolution import SuperResolution
from .color_grading import ColorGrading
from .utils import (
    generate_unique_filename,
    pil_to_cv2,
    cv2_to_pil,
    save_cv2_image,
    compress_for_telegram,
    get_file_size_mb
)

# Configure logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)


class ImageBot:
    """Telegram bot for image super-resolution and color grading"""
    
    def __init__(self):
        """Initialize bot"""
        # Validate configuration
        Config.validate()
        
        # Initialize super-resolution model
        logger.info("Loading super-resolution model...")
        self.sr_model = SuperResolution()
        logger.info("Model loaded successfully!")
        
        # User processing state
        self.user_states = {}
        
        # Initialize application (without job queue since we don't need it)
        self.application = Application.builder().token(Config.BOT_TOKEN).job_queue(None).build()
        
        # Register handlers
        self._register_handlers()
    
    def _register_handlers(self):
        """Register command and message handlers"""
        self.application.add_handler(CommandHandler('start', self.cmd_start))
        self.application.add_handler(CommandHandler('help', self.cmd_help))
        self.application.add_handler(CommandHandler('presets', self.cmd_presets))
        self.application.add_handler(CommandHandler('status', self.cmd_status))
        self.application.add_handler(CommandHandler('cancel', self.cmd_cancel))
        self.application.add_handler(MessageHandler(filters.PHOTO, self.handle_photo))
        self.application.add_handler(MessageHandler(filters.Document.IMAGE, self.handle_document_image))
        self.application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, self.handle_text))
        
        # Error handler
        self.application.add_error_handler(self.error_handler)
    
    @staticmethod
    def restricted(func):
        """Decorator to restrict bot access to authorized users"""
        @wraps(func)
        async def wrapped(self, update: Update, context: ContextTypes.DEFAULT_TYPE, *args, **kwargs):
            user_id = update.effective_user.id
            if user_id not in Config.ADMIN_IDS:
                logger.warning(f"Unauthorized access attempt by user {user_id}")
                await update.message.reply_text("⛔ Sorry, you are not authorized to use this bot.")
                return
            return await func(self, update, context, *args, **kwargs)
        return wrapped
    
    @restricted
    async def cmd_start(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /start command"""
        welcome_message = (
            "🎨 Welcome to Image Enhancement Bot!\n\n"
            "I can upscale your images using AI super-resolution and apply color grading effects.\n\n"
            "📤 How to use:\n"
            "1. Send me an image AS A PHOTO (not as file)\n"
            "2. Wait for processing (10-60 seconds)\n"
            "3. Get your upscaled image!\n"
            "4. Optionally reply with a color preset name\n\n"
            "💡 Commands:\n"
            "/help - Detailed usage guide\n"
            "/presets - List color grading options\n"
            "/status - Check current processing state\n"
            "/cancel - Cancel and clear queue\n\n"
            "⚠️ IMPORTANT RULES:\n"
            "• Send images as PHOTO (compress option)\n"
            "• Wait for 'Processing...' message\n"
            "• Don't send multiple images at once\n"
            "• Each image takes 10-60 seconds\n\n"
            f"🔧 Settings: {Config.MODEL_NAME} | {Config.MODEL_SCALE}x | {'GPU' if Config.USE_GPU else 'CPU'}"
        )
        await update.message.reply_text(welcome_message)
    
    @restricted
    async def cmd_help(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /help command"""
        help_message = (
            "📖 Complete Usage Guide\n\n"
            "━━━━━━━━━━━━━━━━━━━━━━\n"
            "🎯 BASIC WORKFLOW\n"
            "━━━━━━━━━━━━━━━━━━━━━━\n\n"
            "Step 1: Send Image\n"
            "• Tap attachment icon → Photo\n"
            "• Choose 'Send as Photo' (compressed)\n"
            "• NOT 'Send as File'!\n\n"
            "Step 2: Wait for Processing\n"
            "• You'll see: '🔄 Processing...'\n"
            "• This takes 10-60 seconds\n"
            "• CPU: ~40-60 seconds\n"
            "• GPU: ~10-20 seconds\n\n"
            "Step 3: Receive Result\n"
            "• You'll get the upscaled image\n"
            "• It's now 4× larger resolution\n\n"
            "Step 4: Optional Color Grading\n"
            "• Reply with preset name (e.g., 'warm')\n"
            "• Use /presets to see all options\n"
            "• Or skip and send another image\n\n"
            "━━━━━━━━━━━━━━━━━━━━━━\n"
            "⚠️ IMPORTANT RULES\n"
            "━━━━━━━━━━━━━━━━━━━━━━\n\n"
            "❌ DON'T:\n"
            "• Send as 'File' or 'Document'\n"
            "• Send multiple images before first finishes\n"
            "• Send commands during processing\n"
            "• Expect instant results (CPU is slow!)\n\n"
            "✅ DO:\n"
            "• Send as 'Photo' (compressed)\n"
            "• Wait for processing message\n"
            "• Be patient (especially on CPU)\n"
            "• Use /status to check state\n"
            "• Use /cancel if stuck\n\n"
            "━━━━━━━━━━━━━━━━━━━━━━\n"
            "🔍 HOW TO KNOW STATUS\n"
            "━━━━━━━━━━━━━━━━━━━━━━\n\n"
            "✓ Processing Started:\n"
            "  → You see '🔄 Processing...'\n\n"
            "✓ Processing Continues:\n"
            "  → Message updates to '🚀 Upscaling...'\n\n"
            "✓ Processing Complete:\n"
            "  → You receive the upscaled image\n\n"
            "✓ Ready for Color Grading:\n"
            "  → Reply with preset name\n\n"
            "✓ Check Anytime:\n"
            "  → Use /status command\n\n"
            "━━━━━━━━━━━━━━━━━━━━━━\n"
            "🎨 COLOR GRADING\n"
            "━━━━━━━━━━━━━━━━━━━━━━\n\n"
            "After upscaling, reply with:\n"
            "• warm / cool / vibrant\n"
            "• cinematic / vintage\n"
            "• magma / plasma / viridis / turbo\n\n"
            "Use /presets for descriptions\n\n"
            "💡 TIP: Color grading is optional!\n"
            "You can skip it and send another image."
        )
        await update.message.reply_text(help_message)
    
    @restricted
    async def cmd_presets(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /presets command"""
        presets_message = (
            "🎨 Available Color Grading Presets:\n\n"
            "📸 Photographic Styles:\n"
            "• warm - Warm tones, cozy feel\n"
            "• cool - Cool tones, modern look\n"
            "• vibrant - Enhanced saturation and sharpness\n"
            "• cinematic - Film-like with vignette\n"
            "• vintage - Retro, desaturated look\n\n"
            "🌈 Colormap Styles:\n"
            "• magma - Dark purple to yellow\n"
            "• plasma - Purple to yellow gradient\n"
            "• viridis - Blue to yellow scientific\n"
            "• turbo - Rainbow-like colorful\n\n"
            "💡 Usage:\n"
            "After sending an image, reply with the preset name.\n"
            "Example: Send image → Reply with 'cinematic'"
        )
        await update.message.reply_text(presets_message)
    
    @restricted
    async def cmd_status(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /status command - check if image is being processed"""
        user_id = update.effective_user.id
        
        if user_id in self.user_states:
            status_msg = (
                "⏳ You have an image waiting for color grading!\n\n"
                "📝 Next steps:\n"
                "• Reply with a preset name (like 'warm', 'cinematic')\n"
                "• Or send a new image to replace it\n"
                "• Use /cancel to clear and start over"
            )
        else:
            status_msg = (
                "✅ No active processing.\n\n"
                "📤 Ready to receive images!\n"
                "Send me a photo to upscale it."
            )
        
        await update.message.reply_text(status_msg)
    
    @restricted
    async def cmd_cancel(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /cancel command"""
        user_id = update.effective_user.id
        if user_id in self.user_states:
            del self.user_states[user_id]
            await update.message.reply_text("✅ Operation cancelled.")
        else:
            await update.message.reply_text("ℹ️ No active operation to cancel.")
    
    @restricted
    async def handle_photo(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle incoming photo"""
        user_id = update.effective_user.id
        
        logger.info(f"Photo received from user {user_id}")
        
        # Notify user
        processing_msg = await update.message.reply_text("🔄 Processing your image... This may take a moment.")
        
        try:
            # Download photo
            photo = update.message.photo[-1]  # Get highest resolution
            photo_file = await photo.get_file()
            
            # Download to memory
            bio = BytesIO()
            await photo_file.download_to_memory(bio)
            bio.seek(0)
            
            # Open with PIL
            img = Image.open(bio).convert('RGB')
            
            # Save temporarily
            input_filename = generate_unique_filename('png')
            input_path = Config.TEMP_DIR / input_filename
            img.save(input_path)
            
            logger.info(f"Processing image for user {user_id}: {input_filename}")
            
            # Convert to OpenCV format
            img_cv2 = pil_to_cv2(img)
            
            # Upscale
            await processing_msg.edit_text("🚀 Upscaling image with AI...")
            upscaled = self.sr_model.upscale_from_array(img_cv2)
            
            # Save upscaled image
            output_filename = f"upscaled_{input_filename}"
            output_path = Config.TEMP_DIR / output_filename
            save_cv2_image(upscaled, output_path, quality=95)
            
            # Compress if needed
            output_path = compress_for_telegram(output_path)
            
            # Store state for possible color grading
            self.user_states[user_id] = {
                'upscaled_path': output_path,
                'input_path': input_path
            }
            
            # Send result
            await processing_msg.edit_text("✨ Upscaling complete! Sending image...")
            
            # Check file size and decide if sending as photo or document
            file_size = os.path.getsize(output_path)
            
            with open(output_path, 'rb') as f:
                if file_size <= 10 * 1024 * 1024:  # 10MB limit for photos
                    await update.message.reply_photo(
                        photo=f,
                        caption=(
                            f"✅ Image upscaled {Config.MODEL_SCALE}× successfully!\n\n"
                            "💡 Want to apply color grading? Reply with a preset name.\n"
                            "Use /presets to see available options, or send another image."
                        )
                    )
                else:
                    # File too large for photo, send as document
                    await update.message.reply_document(
                        document=f,
                        caption=(
                            f"✅ Image upscaled {Config.MODEL_SCALE}× successfully!\n\n"
                            "⚠️ Image sent as file due to size (>10MB)\n\n"
                            "💡 Want to apply color grading? Reply with a preset name.\n"
                            "Use /presets to see available options, or send another image."
                        )
                    )
            
            # Delete processing message
            await processing_msg.delete()
            
            logger.info(f"Successfully processed image for user {user_id}")
            
        except Exception as e:
            logger.error(f"Error processing image: {e}", exc_info=True)
            await processing_msg.edit_text(f"❌ Error processing image: {str(e)}")
            
            # Cleanup
            if user_id in self.user_states:
                del self.user_states[user_id]
    
    @restricted
    async def handle_document_image(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle images sent as documents/files"""
        user_id = update.effective_user.id
        
        logger.info(f"Image document received from user {user_id}")
        
        # Notify user
        processing_msg = await update.message.reply_text(
            "📄 Image received as document.\n"
            "💡 Tip: Send images as 'Photo' (not 'File') for faster processing.\n"
            "🔄 Processing..."
        )
        
        try:
            # Download document
            document = update.message.document
            doc_file = await document.get_file()
            
            # Download to memory
            bio = BytesIO()
            await doc_file.download_to_memory(bio)
            bio.seek(0)
            
            # Open with PIL
            img = Image.open(bio).convert('RGB')
            
            # Save temporarily
            input_filename = generate_unique_filename('png')
            input_path = Config.TEMP_DIR / input_filename
            img.save(input_path)
            
            logger.info(f"Processing image document for user {user_id}: {input_filename}")
            
            # Convert to OpenCV format
            img_cv2 = pil_to_cv2(img)
            
            # Upscale
            await processing_msg.edit_text("🚀 Upscaling image with AI...")
            upscaled = self.sr_model.upscale_from_array(img_cv2)
            
            # Save upscaled image
            output_filename = f"upscaled_{input_filename}"
            output_path = Config.TEMP_DIR / output_filename
            save_cv2_image(upscaled, output_path, quality=95)
            
            # Compress if needed
            output_path = compress_for_telegram(output_path)
            
            # Store state for possible color grading
            self.user_states[user_id] = {
                'upscaled_path': output_path,
                'input_path': input_path
            }
            
            # Send result
            await processing_msg.edit_text("✨ Upscaling complete! Sending image...")
            
            # Check file size and decide if sending as photo or document
            file_size = os.path.getsize(output_path)
            
            with open(output_path, 'rb') as f:
                if file_size <= 10 * 1024 * 1024:  # 10MB limit for photos
                    await update.message.reply_photo(
                        photo=f,
                        caption=(
                            f"✅ Image upscaled {Config.MODEL_SCALE}× successfully!\n\n"
                            "💡 Want to apply color grading? Reply with a preset name.\n"
                            "Use /presets to see available options, or send another image."
                        )
                    )
                else:
                    # File too large for photo, send as document
                    await update.message.reply_document(
                        document=f,
                        caption=(
                            f"✅ Image upscaled {Config.MODEL_SCALE}× successfully!\n\n"
                            "⚠️ Image sent as file due to size (>10MB)\n\n"
                            "💡 Want to apply color grading? Reply with a preset name.\n"
                            "Use /presets to see available options, or send another image."
                        )
                    )
            
            # Delete processing message
            await processing_msg.delete()
            
            logger.info(f"Successfully processed image document for user {user_id}")
            
        except Exception as e:
            logger.error(f"Error processing image document: {e}", exc_info=True)
            await processing_msg.edit_text(f"❌ Error processing image: {str(e)}")
            
            # Cleanup
            if user_id in self.user_states:
                del self.user_states[user_id]
    
    @restricted
    async def handle_text(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle text messages (preset names)"""
        user_id = update.effective_user.id
        
        # Check if user has a pending image
        if user_id not in self.user_states:
            await update.message.reply_text(
                "ℹ️ Please send an image first!\n"
                "Use /help for instructions."
            )
            return
        
        preset_name = update.message.text.strip().lower()
        state = self.user_states[user_id]
        upscaled_path = state['upscaled_path']
        
        # Notify user
        processing_msg = await update.message.reply_text(f"🎨 Applying '{preset_name}' preset...")
        
        try:
            # Load upscaled image
            img = Image.open(upscaled_path)
            img_cv2 = pil_to_cv2(img)
            
            # Apply color grading
            graded = ColorGrading.apply_preset(img_cv2, preset_name)
            
            # Save result
            output_filename = f"graded_{preset_name}_{upscaled_path.name}"
            output_path = Config.TEMP_DIR / output_filename
            save_cv2_image(graded, output_path, quality=95)
            
            # Compress if needed
            output_path = compress_for_telegram(output_path)
            
            # Send result
            await processing_msg.edit_text("✨ Color grading complete! Sending image...")
            
            # Check file size and decide if sending as photo or document
            file_size = os.path.getsize(output_path)
            
            with open(output_path, 'rb') as f:
                if file_size <= 10 * 1024 * 1024:  # 10MB limit for photos
                    await update.message.reply_photo(
                        photo=f,
                        caption=f"✅ Applied '{preset_name}' preset successfully!"
                    )
                else:
                    # File too large for photo, send as document
                    await update.message.reply_document(
                        document=f,
                        caption=(
                            f"✅ Applied '{preset_name}' preset successfully!\n\n"
                            "⚠️ Image sent as file due to size (>10MB)"
                        )
                    )
            
            # Delete processing message
            await processing_msg.delete()
            
            # Cleanup temp files
            try:
                upscaled_path.unlink()
                output_path.unlink()
                state['input_path'].unlink()
            except:
                pass
            
            # Clear state
            del self.user_states[user_id]
            
            logger.info(f"Applied preset '{preset_name}' for user {user_id}")
            
        except ValueError as e:
            await processing_msg.edit_text(
                f"❌ Unknown preset: '{preset_name}'\n"
                "Use /presets to see available options."
            )
        except Exception as e:
            logger.error(f"Error applying preset: {e}", exc_info=True)
            await processing_msg.edit_text(f"❌ Error applying preset: {str(e)}")
    
    async def error_handler(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle errors"""
        logger.error(f"Update {update} caused error {context.error}", exc_info=context.error)
        
        if update and update.effective_message:
            await update.effective_message.reply_text(
                "❌ An error occurred. Please try again or contact the admin."
            )
    
    def run(self):
        """Start the bot"""
        logger.info("Starting bot...")
        self.application.run_polling(allowed_updates=Update.ALL_TYPES)
        logger.info("Bot stopped.")


def main():
    """Main entry point"""
    bot = ImageBot()
    bot.run()


if __name__ == '__main__':
    main()
