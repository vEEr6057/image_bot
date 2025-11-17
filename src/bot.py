"""
Main Telegram Bot for Image Super-Resolution and Color Grading
"""
import logging
import os
from io import BytesIO
from pathlib import Path
from functools import wraps

from telegram import Update, ParseMode
from telegram.ext import Updater, CommandHandler, MessageHandler, Filters, CallbackContext
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
        
        # Initialize bot
        self.updater = Updater(Config.BOT_TOKEN, use_context=True)
        self.dispatcher = self.updater.dispatcher
        
        # Register handlers
        self._register_handlers()
    
    def _register_handlers(self):
        """Register command and message handlers"""
        self.dispatcher.add_handler(CommandHandler('start', self.cmd_start))
        self.dispatcher.add_handler(CommandHandler('help', self.cmd_help))
        self.dispatcher.add_handler(CommandHandler('presets', self.cmd_presets))
        self.dispatcher.add_handler(CommandHandler('cancel', self.cmd_cancel))
        self.dispatcher.add_handler(MessageHandler(Filters.photo, self.handle_photo))
        self.dispatcher.add_handler(MessageHandler(Filters.text & ~Filters.command, self.handle_text))
        
        # Error handler
        self.dispatcher.add_error_handler(self.error_handler)
    
    @staticmethod
    def restricted(func):
        """Decorator to restrict bot access to authorized users"""
        @wraps(func)
        def wrapped(self, update: Update, context: CallbackContext, *args, **kwargs):
            user_id = update.effective_user.id
            if user_id not in Config.ADMIN_IDS:
                logger.warning(f"Unauthorized access attempt by user {user_id}")
                update.message.reply_text("⛔ Sorry, you are not authorized to use this bot.")
                return
            return func(self, update, context, *args, **kwargs)
        return wrapped
    
    @restricted
    def cmd_start(self, update: Update, context: CallbackContext):
        """Handle /start command"""
        welcome_message = (
            "🎨 *Welcome to Image Enhancement Bot!*\n\n"
            "I can upscale your images using AI super-resolution and apply color grading effects.\n\n"
            "📤 *How to use:*\n"
            "1. Send me an image\n"
            "2. Optionally specify a color preset (or skip for upscaling only)\n"
            "3. Get your enhanced image!\n\n"
            "💡 Commands:\n"
            "/help - Show detailed help\n"
            "/presets - List available color presets\n"
            "/cancel - Cancel current operation\n\n"
            f"🔧 Current settings:\n"
            f"• Model: {Config.MODEL_NAME}\n"
            f"• Scale: {Config.MODEL_SCALE}x\n"
            f"• Device: {'GPU' if Config.USE_GPU else 'CPU'}"
        )
        update.message.reply_text(welcome_message, parse_mode=ParseMode.MARKDOWN)
    
    @restricted
    def cmd_help(self, update: Update, context: CallbackContext):
        """Handle /help command"""
        help_message = (
            "📖 *Detailed Help*\n\n"
            "*Basic Usage:*\n"
            "1. Send an image (as photo, not file)\n"
            "2. Wait for processing (may take 10-60 seconds)\n"
            "3. Receive upscaled image\n\n"
            "*With Color Grading:*\n"
            "1. Send an image\n"
            "2. Reply with a preset name (e.g., 'warm', 'cinematic')\n"
            "3. Receive upscaled + color graded image\n\n"
            "*Available Presets:*\n"
            "Use /presets to see all available color grading options\n\n"
            "*Tips:*\n"
            "• Larger images take longer to process\n"
            "• Images are upscaled by 4× by default\n"
            "• Color grading is optional\n"
            "• Use /cancel to stop current operation"
        )
        update.message.reply_text(help_message, parse_mode=ParseMode.MARKDOWN)
    
    @restricted
    def cmd_presets(self, update: Update, context: CallbackContext):
        """Handle /presets command"""
        presets_message = (
            "🎨 *Available Color Grading Presets:*\n\n"
            "📸 *Photographic Styles:*\n"
            "• `warm` - Warm tones, cozy feel\n"
            "• `cool` - Cool tones, modern look\n"
            "• `vibrant` - Enhanced saturation and sharpness\n"
            "• `cinematic` - Film-like with vignette\n"
            "• `vintage` - Retro, desaturated look\n\n"
            "🌈 *Colormap Styles:*\n"
            "• `magma` - Dark purple to yellow\n"
            "• `plasma` - Purple to yellow gradient\n"
            "• `viridis` - Blue to yellow scientific\n"
            "• `turbo` - Rainbow-like colorful\n\n"
            "💡 *Usage:*\n"
            "After sending an image, reply with the preset name.\n"
            "Example: Send image → Reply with 'cinematic'"
        )
        update.message.reply_text(presets_message, parse_mode=ParseMode.MARKDOWN)
    
    @restricted
    def cmd_cancel(self, update: Update, context: CallbackContext):
        """Handle /cancel command"""
        user_id = update.effective_user.id
        if user_id in self.user_states:
            del self.user_states[user_id]
            update.message.reply_text("✅ Operation cancelled.")
        else:
            update.message.reply_text("ℹ️ No active operation to cancel.")
    
    @restricted
    def handle_photo(self, update: Update, context: CallbackContext):
        """Handle incoming photo"""
        user_id = update.effective_user.id
        
        # Notify user
        processing_msg = update.message.reply_text("🔄 Processing your image... This may take a moment.")
        
        try:
            # Download photo
            photo = update.message.photo[-1]  # Get highest resolution
            photo_file = photo.get_file()
            
            # Download to memory
            bio = BytesIO()
            photo_file.download(out=bio)
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
            processing_msg.edit_text("🚀 Upscaling image with AI...")
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
            processing_msg.edit_text("✨ Upscaling complete! Sending image...")
            
            with open(output_path, 'rb') as f:
                update.message.reply_photo(
                    photo=f,
                    caption=(
                        f"✅ Image upscaled {Config.MODEL_SCALE}× successfully!\n\n"
                        "💡 Want to apply color grading? Reply with a preset name.\n"
                        "Use /presets to see available options, or send another image."
                    )
                )
            
            # Delete processing message
            processing_msg.delete()
            
            logger.info(f"Successfully processed image for user {user_id}")
            
        except Exception as e:
            logger.error(f"Error processing image: {e}", exc_info=True)
            processing_msg.edit_text(f"❌ Error processing image: {str(e)}")
            
            # Cleanup
            if user_id in self.user_states:
                del self.user_states[user_id]
    
    @restricted
    def handle_text(self, update: Update, context: CallbackContext):
        """Handle text messages (preset names)"""
        user_id = update.effective_user.id
        
        # Check if user has a pending image
        if user_id not in self.user_states:
            update.message.reply_text(
                "ℹ️ Please send an image first!\n"
                "Use /help for instructions."
            )
            return
        
        preset_name = update.message.text.strip().lower()
        state = self.user_states[user_id]
        upscaled_path = state['upscaled_path']
        
        # Notify user
        processing_msg = update.message.reply_text(f"🎨 Applying '{preset_name}' preset...")
        
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
            processing_msg.edit_text("✨ Color grading complete! Sending image...")
            
            with open(output_path, 'rb') as f:
                update.message.reply_photo(
                    photo=f,
                    caption=f"✅ Applied '{preset_name}' preset successfully!"
                )
            
            # Delete processing message
            processing_msg.delete()
            
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
            processing_msg.edit_text(
                f"❌ Unknown preset: '{preset_name}'\n"
                "Use /presets to see available options."
            )
        except Exception as e:
            logger.error(f"Error applying preset: {e}", exc_info=True)
            processing_msg.edit_text(f"❌ Error applying preset: {str(e)}")
    
    def error_handler(self, update: Update, context: CallbackContext):
        """Handle errors"""
        logger.error(f"Update {update} caused error {context.error}", exc_info=context.error)
        
        if update and update.effective_message:
            update.effective_message.reply_text(
                "❌ An error occurred. Please try again or contact the admin."
            )
    
    def run(self):
        """Start the bot"""
        logger.info("Starting bot...")
        self.updater.start_polling()
        logger.info("Bot is running! Press Ctrl+C to stop.")
        self.updater.idle()


def main():
    """Main entry point"""
    bot = ImageBot()
    bot.run()


if __name__ == '__main__':
    main()
