"""
Super-Resolution module using Real-ESRGAN
"""
import torch
import cv2
import numpy as np
from pathlib import Path
from basicsr.archs.rrdbnet_arch import RRDBNet
from realesrgan import RealESRGANer
from realesrgan.archs.srvgg_arch import SRVGGNetCompact

from .config import Config


class SuperResolution:
    """Handle image super-resolution using Real-ESRGAN"""
    
    def __init__(self):
        self.device = torch.device('cuda' if Config.USE_GPU and torch.cuda.is_available() else 'cpu')
        self.model = None
        self._load_model()
    
    def _load_model(self):
        """Load Real-ESRGAN model"""
        model_path = Config.get_model_path()
        
        # Check if model exists
        if not model_path.exists():
            print(f"Model not found at {model_path}")
            print("Downloading model... (this may take a while)")
            self._download_model(model_path)
        
        # Select appropriate architecture based on model name
        if 'anime' in Config.MODEL_NAME.lower():
            # Anime model uses RRDBNet with 6 blocks
            model = RRDBNet(num_in_ch=3, num_out_ch=3, num_feat=64, num_block=6, num_grow_ch=32, scale=4)
            netscale = 4
        elif 'x2' in Config.MODEL_NAME.lower():
            model = RRDBNet(num_in_ch=3, num_out_ch=3, num_feat=64, num_block=23, num_grow_ch=32, scale=2)
            netscale = 2
        else:
            # Default x4plus model
            model = RRDBNet(num_in_ch=3, num_out_ch=3, num_feat=64, num_block=23, num_grow_ch=32, scale=4)
            netscale = 4
        
        # Initialize RealESRGANer
        self.model = RealESRGANer(
            scale=netscale,
            model_path=str(model_path),
            model=model,
            tile=Config.TILE_SIZE,
            tile_pad=10,
            pre_pad=0,
            half=Config.USE_FP16 and self.device.type == 'cuda',
            device=self.device
        )
        
        print(f"Model loaded: {Config.MODEL_NAME} on {self.device}")
    
    def _download_model(self, model_path):
        """Download model weights from GitHub releases"""
        import urllib.request
        
        base_url = "https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/"
        model_urls = {
            'RealESRGAN_x4plus.pth': base_url + 'RealESRGAN_x4plus.pth',
            'RealESRGAN_x4plus_anime_6B.pth': base_url + 'RealESRGAN_x4plus_anime_6B.pth',
            'RealESRGAN_x2plus.pth': base_url + 'RealESRGAN_x2plus.pth',
        }
        
        model_file = model_path.name
        if model_file not in model_urls:
            raise ValueError(f"Unknown model: {model_file}")
        
        url = model_urls[model_file]
        print(f"Downloading from {url}")
        
        try:
            urllib.request.urlretrieve(url, model_path)
            print(f"Model downloaded successfully to {model_path}")
        except Exception as e:
            raise RuntimeError(f"Failed to download model: {e}")
    
    def upscale(self, image_path, output_path=None):
        """
        Upscale an image using Real-ESRGAN
        
        Args:
            image_path: Path to input image
            output_path: Path to save output (optional)
        
        Returns:
            Upscaled image as numpy array (BGR format)
        """
        # Read image
        img = cv2.imread(str(image_path), cv2.IMREAD_COLOR)
        if img is None:
            raise ValueError(f"Failed to read image: {image_path}")
        
        # Run super-resolution
        try:
            output, _ = self.model.enhance(img, outscale=Config.MODEL_SCALE)
        except RuntimeError as e:
            if 'out of memory' in str(e):
                # Try with smaller tile size
                print("GPU out of memory, retrying with smaller tiles...")
                self.model.tile = max(256, Config.TILE_SIZE // 2)
                output, _ = self.model.enhance(img, outscale=Config.MODEL_SCALE)
            else:
                raise e
        
        # Save if output path provided
        if output_path:
            cv2.imwrite(str(output_path), output)
        
        return output
    
    def upscale_from_array(self, img_array):
        """
        Upscale from numpy array (RGB format)
        
        Args:
            img_array: numpy array in RGB format
        
        Returns:
            Upscaled image as numpy array (RGB format)
        """
        # Convert RGB to BGR for OpenCV
        img_bgr = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)
        
        # Run super-resolution
        try:
            output_bgr, _ = self.model.enhance(img_bgr, outscale=Config.MODEL_SCALE)
        except RuntimeError as e:
            if 'out of memory' in str(e):
                print("GPU out of memory, retrying with smaller tiles...")
                self.model.tile = max(256, Config.TILE_SIZE // 2)
                output_bgr, _ = self.model.enhance(img_bgr, outscale=Config.MODEL_SCALE)
            else:
                raise e
        
        # Convert back to RGB
        output_rgb = cv2.cvtColor(output_bgr, cv2.COLOR_BGR2RGB)
        return output_rgb
