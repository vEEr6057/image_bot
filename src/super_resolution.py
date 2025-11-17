"""
Super-Resolution module using Real-ESRGAN (standalone implementation)
"""
import torch
import torch.nn as nn
import cv2
import numpy as np
from pathlib import Path
import urllib.request

from .config import Config


class RRDBNet(nn.Module):
    """RRDB Network for Real-ESRGAN (standalone implementation)"""
    
    def __init__(self, num_in_ch=3, num_out_ch=3, num_feat=64, num_block=23, num_grow_ch=32, scale=4):
        super(RRDBNet, self).__init__()
        self.scale = scale
        
        # First convolution
        self.conv_first = nn.Conv2d(num_in_ch, num_feat, 3, 1, 1)
        
        # RRDB blocks
        self.body = nn.ModuleList()
        for _ in range(num_block):
            self.body.append(RRDB(num_feat, num_grow_ch))
        
        # Trunk conv
        self.conv_body = nn.Conv2d(num_feat, num_feat, 3, 1, 1)
        
        # Upsampling
        self.conv_up1 = nn.Conv2d(num_feat, num_feat, 3, 1, 1)
        self.conv_up2 = nn.Conv2d(num_feat, num_feat, 3, 1, 1)
        self.conv_hr = nn.Conv2d(num_feat, num_feat, 3, 1, 1)
        self.conv_last = nn.Conv2d(num_feat, num_out_ch, 3, 1, 1)
        
        self.lrelu = nn.LeakyReLU(negative_slope=0.2, inplace=True)
    
    def forward(self, x):
        feat = self.conv_first(x)
        body_feat = feat
        
        for block in self.body:
            body_feat = block(body_feat)
        
        body_feat = self.conv_body(body_feat)
        feat = feat + body_feat
        
        # Upsample
        feat = self.lrelu(self.conv_up1(nn.functional.interpolate(feat, scale_factor=2, mode='nearest')))
        feat = self.lrelu(self.conv_up2(nn.functional.interpolate(feat, scale_factor=2, mode='nearest')))
        out = self.conv_last(self.lrelu(self.conv_hr(feat)))
        
        return out


class ResidualDenseBlock(nn.Module):
    """Residual Dense Block"""
    
    def __init__(self, num_feat=64, num_grow_ch=32):
        super(ResidualDenseBlock, self).__init__()
        self.conv1 = nn.Conv2d(num_feat, num_grow_ch, 3, 1, 1)
        self.conv2 = nn.Conv2d(num_feat + num_grow_ch, num_grow_ch, 3, 1, 1)
        self.conv3 = nn.Conv2d(num_feat + 2 * num_grow_ch, num_grow_ch, 3, 1, 1)
        self.conv4 = nn.Conv2d(num_feat + 3 * num_grow_ch, num_grow_ch, 3, 1, 1)
        self.conv5 = nn.Conv2d(num_feat + 4 * num_grow_ch, num_feat, 3, 1, 1)
        self.lrelu = nn.LeakyReLU(negative_slope=0.2, inplace=True)
    
    def forward(self, x):
        x1 = self.lrelu(self.conv1(x))
        x2 = self.lrelu(self.conv2(torch.cat((x, x1), 1)))
        x3 = self.lrelu(self.conv3(torch.cat((x, x1, x2), 1)))
        x4 = self.lrelu(self.conv4(torch.cat((x, x1, x2, x3), 1)))
        x5 = self.conv5(torch.cat((x, x1, x2, x3, x4), 1))
        return x5 * 0.2 + x


class RRDB(nn.Module):
    """Residual in Residual Dense Block"""
    
    def __init__(self, num_feat, num_grow_ch=32):
        super(RRDB, self).__init__()
        self.rdb1 = ResidualDenseBlock(num_feat, num_grow_ch)
        self.rdb2 = ResidualDenseBlock(num_feat, num_grow_ch)
        self.rdb3 = ResidualDenseBlock(num_feat, num_grow_ch)
    
    def forward(self, x):
        out = self.rdb1(x)
        out = self.rdb2(out)
        out = self.rdb3(out)
        return out * 0.2 + x


class SuperResolution:
    """Handle image super-resolution using Real-ESRGAN"""
    
    def __init__(self):
        self.device = torch.device('cuda' if Config.USE_GPU and torch.cuda.is_available() else 'cpu')
        self.model = None
        self.scale = Config.MODEL_SCALE
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
            self.scale = 4
        elif 'x2' in Config.MODEL_NAME.lower():
            model = RRDBNet(num_in_ch=3, num_out_ch=3, num_feat=64, num_block=23, num_grow_ch=32, scale=2)
            self.scale = 2
        else:
            # Default x4plus model
            model = RRDBNet(num_in_ch=3, num_out_ch=3, num_feat=64, num_block=23, num_grow_ch=32, scale=4)
            self.scale = 4
        
        # Load weights
        print(f"Loading model from {model_path}")
        state_dict = torch.load(str(model_path), map_location=self.device)
        
        # Handle different state dict formats
        if 'params_ema' in state_dict:
            state_dict = state_dict['params_ema']
        elif 'params' in state_dict:
            state_dict = state_dict['params']
        
        model.load_state_dict(state_dict, strict=True)
        model.eval()
        model = model.to(self.device)
        
        if Config.USE_FP16 and self.device.type == 'cuda':
            model = model.half()
        
        self.model = model
        print(f"Model loaded: {Config.MODEL_NAME} on {self.device}")
    
    def _download_model(self, model_path):
        """Download model weights from GitHub releases"""
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
        
        try:
            # Download with progress
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
    
    def _process_image(self, img, tile_size=512):
        """Process image with tiling support"""
        h, w = img.shape[:2]
        
        # If image is small enough, process directly
        if h <= tile_size and w <= tile_size:
            return self._inference(img)
        
        # Tile-based processing for large images
        output_h = h * self.scale
        output_w = w * self.scale
        output = np.zeros((output_h, output_w, 3), dtype=np.uint8)
        
        tile_pad = 10
        stride = tile_size - 2 * tile_pad
        
        for i in range(0, h, stride):
            for j in range(0, w, stride):
                # Extract tile with padding
                tile_h_start = max(0, i - tile_pad)
                tile_h_end = min(h, i + tile_size + tile_pad)
                tile_w_start = max(0, j - tile_pad)
                tile_w_end = min(w, j + tile_size + tile_pad)
                
                tile = img[tile_h_start:tile_h_end, tile_w_start:tile_w_end]
                
                # Process tile
                output_tile = self._inference(tile)
                
                # Calculate positions in output
                out_h_start = tile_h_start * self.scale
                out_h_end = tile_h_end * self.scale
                out_w_start = tile_w_start * self.scale
                out_w_end = tile_w_end * self.scale
                
                # Place tile in output (handle overlapping areas by taking average)
                output[out_h_start:out_h_end, out_w_start:out_w_end] = output_tile
        
        return output
    
    def _inference(self, img):
        """Run inference on a single image or tile"""
        # Convert to tensor
        img_tensor = torch.from_numpy(img).float().permute(2, 0, 1).unsqueeze(0) / 255.0
        img_tensor = img_tensor.to(self.device)
        
        if Config.USE_FP16 and self.device.type == 'cuda':
            img_tensor = img_tensor.half()
        
        # Run model
        with torch.no_grad():
            output_tensor = self.model(img_tensor)
        
        # Convert back to numpy
        output = output_tensor.squeeze(0).permute(1, 2, 0).cpu().float().numpy()
        output = np.clip(output * 255.0, 0, 255).astype(np.uint8)
        
        return output
    
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
        
        # Run super-resolution with tiling
        try:
            output = self._process_image(img, tile_size=Config.TILE_SIZE)
        except RuntimeError as e:
            if 'out of memory' in str(e):
                # Try with smaller tile size
                print("GPU out of memory, retrying with smaller tiles...")
                output = self._process_image(img, tile_size=max(256, Config.TILE_SIZE // 2))
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
        
        # Run super-resolution with tiling
        try:
            output_bgr = self._process_image(img_bgr, tile_size=Config.TILE_SIZE)
        except RuntimeError as e:
            if 'out of memory' in str(e):
                print("GPU out of memory, retrying with smaller tiles...")
                output_bgr = self._process_image(img_bgr, tile_size=max(256, Config.TILE_SIZE // 2))
            else:
                raise e
        
        # Convert back to RGB
        output_rgb = cv2.cvtColor(output_bgr, cv2.COLOR_BGR2RGB)
        return output_rgb
