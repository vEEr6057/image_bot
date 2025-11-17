"""
Configuration loader for the Image Bot
"""
import os
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
load_dotenv()

class Config:
    """Bot configuration"""
    
    # Telegram Bot
    BOT_TOKEN = os.getenv('BOT_TOKEN')
    ADMIN_IDS = [int(id.strip()) for id in os.getenv('ADMIN_IDS', '').split(',') if id.strip()]
    
    # Model settings
    MODEL_NAME = os.getenv('MODEL_NAME', 'RealESRGAN_x4plus')
    MODEL_SCALE = int(os.getenv('MODEL_SCALE', '4'))
    TILE_SIZE = int(os.getenv('TILE_SIZE', '1024'))
    TILE_PAD = int(os.getenv('TILE_PAD', '64'))
    PRE_PAD = int(os.getenv('PRE_PAD', '10'))
    
    # Processing options
    USE_FP16 = os.getenv('USE_FP16', 'true').lower() == 'true'
    USE_GPU = os.getenv('USE_GPU', 'true').lower() == 'true'
    
    # Paths
    BASE_DIR = Path(__file__).parent.parent
    WEIGHTS_DIR = BASE_DIR / os.getenv('WEIGHTS_DIR', 'weights')
    TEMP_DIR = BASE_DIR / os.getenv('TEMP_DIR', 'temp')
    
    # Model paths
    MODEL_PATHS = {
        'RealESRGAN_x4plus': 'RealESRGAN_x4plus.pth',
        'RealESRGAN_x4plus_anime_6B': 'RealESRGAN_x4plus_anime_6B.pth',
        'RealESRGAN_x2plus': 'RealESRGAN_x2plus.pth',
    }
    
    @classmethod
    def get_model_path(cls):
        """Get full path to model weights"""
        model_file = cls.MODEL_PATHS.get(cls.MODEL_NAME, 'RealESRGAN_x4plus.pth')
        return cls.WEIGHTS_DIR / model_file
    
    @classmethod
    def validate(cls):
        """Validate configuration"""
        if not cls.BOT_TOKEN:
            raise ValueError("BOT_TOKEN is required in .env file")
        if not cls.ADMIN_IDS:
            raise ValueError("ADMIN_IDS is required in .env file")
        
        # Create directories if they don't exist
        cls.WEIGHTS_DIR.mkdir(parents=True, exist_ok=True)
        cls.TEMP_DIR.mkdir(parents=True, exist_ok=True)
