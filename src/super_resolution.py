"""
Super-Resolution module using Real-ESRGAN (official package)
"""
import cv2
import numpy as np
from pathlib import Path

from .config import Config

try:
    from realesrgan import RealESRGANer
    from basicsr.archs.rrdbnet_arch import RRDBNet
    OFFICIAL_REALESRGAN = True
except ImportError as e:
    OFFICIAL_REALESRGAN = False
    print(f"Warning: Official Real-ESRGAN not available: {e}")
    print("Install with: pip install realesrgan basicsr")


class SuperResolution:
    """Handle image super-resolution using Real-ESRGAN"""
    
    def __init__(self):
        if not OFFICIAL_REALESRGAN:
            raise ImportError(
                "Official Real-ESRGAN package not installed. "
                "Install with: pip install realesrgan basicsr facexlib gfpgan"
            )
        
        self.upsampler = None
        self.scale = Config.MODEL_SCALE
        self._load_model()
    
    def _load_model(self):
        """Load Real-ESRGAN model using official RealESRGANer"""
        model_path = Config.get_model_path()
        
        # Check if model exists
        if not model_path.exists():
            print(f"Model not found at {model_path}")
            print("Downloading model... (this may take a while)")
            self._download_model(model_path)
        
        # Select appropriate architecture based on model name
        model_name = Config.MODEL_NAME.lower()
        
        if 'anime' in model_name:
            # Anime model uses 6 blocks
            model = RRDBNet(num_in_ch=3, num_out_ch=3, num_feat=64, num_block=6, num_grow_ch=32, scale=4)
            netscale = 4
        elif 'x2' in model_name:
            # x2 model
            model = RRDBNet(num_in_ch=3, num_out_ch=3, num_feat=64, num_block=23, num_grow_ch=32, scale=2)
            netscale = 2
        else:
            # Default x4plus model (23 blocks)
            model = RRDBNet(num_in_ch=3, num_out_ch=3, num_feat=64, num_block=23, num_grow_ch=32, scale=4)
            netscale = 4
        
        self.scale = netscale
        
        # Determine GPU settings
        if Config.USE_GPU:
            try:
                import torch
                gpu_id = 0 if torch.cuda.is_available() else None
            except ImportError:
                gpu_id = None
        else:
            gpu_id = None
        
        # Create upsampler with optimal settings for quality
        self.upsampler = RealESRGANer(
            scale=netscale,
            model_path=str(model_path),
            model=model,
            tile=Config.TILE_SIZE,           # Tile size for processing
            tile_pad=Config.TILE_PAD,        # Padding to reduce seams
            pre_pad=Config.PRE_PAD,          # Pre-padding for border handling
            half=Config.USE_FP16,            # FP16 for speed on GPU
            gpu_id=gpu_id
        )
        
        device_name = "GPU" if gpu_id is not None else "CPU"
        print(f"Model loaded: {Config.MODEL_NAME} on {device_name}")
        print(f"Settings: tile={Config.TILE_SIZE}, tile_pad={Config.TILE_PAD}, pre_pad={Config.PRE_PAD}, half={Config.USE_FP16}")
    
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
        print("This may take several minutes (~65 MB)...")
        
        # Ensure directory exists
        model_path.parent.mkdir(parents=True, exist_ok=True)
        
        try:
            # Try with requests for progress bar
            import requests
            response = requests.get(url, stream=True)
            response.raise_for_status()
            
            total_size = int(response.headers.get('content-length', 0))
            block_size = 8192
            
            with open(model_path, 'wb') as f:
                downloaded = 0
                for chunk in response.iter_content(chunk_size=block_size):
                    if chunk:
                        f.write(chunk)
                        downloaded += len(chunk)
                        if total_size > 0:
                            progress = (downloaded / total_size) * 100
                            print(f"\rDownloading: {progress:.1f}% ({downloaded / (1024*1024):.1f} MB / {total_size / (1024*1024):.1f} MB)", end='')
            
            print(f"\nModel downloaded successfully to {model_path}")
        except ImportError:
            # Fallback to urllib if requests not available
            print("Using urllib (no progress bar)...")
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
        
        # Run super-resolution (automatic tiling with Gaussian blending)
        try:
            output, _ = self.upsampler.enhance(img, outscale=self.scale)
        except RuntimeError as e:
            if 'out of memory' in str(e).lower():
                # Retry with smaller tile size
                print("GPU out of memory, retrying with smaller tiles...")
                original_tile = self.upsampler.tile
                self.upsampler.tile = max(256, original_tile // 2)
                output, _ = self.upsampler.enhance(img, outscale=self.scale)
                self.upsampler.tile = original_tile  # Restore original
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
        # Convert RGB to BGR for processing
        img_bgr = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)
        
        # Run super-resolution (automatic tiling with Gaussian blending)
        try:
            output_bgr, _ = self.upsampler.enhance(img_bgr, outscale=self.scale)
        except RuntimeError as e:
            if 'out of memory' in str(e).lower():
                print("GPU out of memory, retrying with smaller tiles...")
                original_tile = self.upsampler.tile
                self.upsampler.tile = max(256, original_tile // 2)
                output_bgr, _ = self.upsampler.enhance(img_bgr, outscale=self.scale)
                self.upsampler.tile = original_tile  # Restore original
            else:
                raise e
        
        # Convert back to RGB
        output_rgb = cv2.cvtColor(output_bgr, cv2.COLOR_BGR2RGB)
        return output_rgb

