"""
Flask API Server for Image Enhancement - Colab Version
Standalone version with all dependencies inlined
"""
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import logging
from io import BytesIO
from PIL import Image
import sys
import cv2
import numpy as np
from pathlib import Path

# Patch torchvision compatibility
try:
    import torchvision.transforms.functional as F
    
    class FunctionalTensorModule:
        @staticmethod
        def rgb_to_grayscale(img, num_output_channels=1):
            return F.rgb_to_grayscale(img, num_output_channels)
    
    sys.modules['torchvision.transforms.functional_tensor'] = FunctionalTensorModule()
except Exception:
    pass

# Import Real-ESRGAN
from realesrgan import RealESRGANer
from basicsr.archs.rrdbnet_arch import RRDBNet

# Configure logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Configuration (from environment or defaults)
USE_GPU = os.getenv('USE_GPU', 'true').lower() == 'true'
TILE_SIZE = int(os.getenv('TILE_SIZE', '1024'))
TILE_PAD = int(os.getenv('TILE_PAD', '64'))
PRE_PAD = int(os.getenv('PRE_PAD', '10'))
USE_FP16 = os.getenv('USE_FP16', 'true').lower() == 'true'
MODEL_NAME = 'RealESRGAN_x4plus'

# Utility functions
def pil_to_cv2(pil_image):
    """Convert PIL Image to OpenCV format (BGR)"""
    # Convert PIL to RGB numpy array
    rgb_array = np.array(pil_image.convert('RGB'))
    # Convert RGB to BGR for OpenCV
    bgr_array = cv2.cvtColor(rgb_array, cv2.COLOR_RGB2BGR)
    return bgr_array

def cv2_to_pil(cv2_image):
    """Convert OpenCV image (BGR) to PIL Image"""
    # Convert BGR to RGB
    rgb_array = cv2.cvtColor(cv2_image, cv2.COLOR_BGR2RGB)
    # Convert to PIL
    pil_image = Image.fromarray(rgb_array)
    return pil_image

def download_model(model_path):
    """Download Real-ESRGAN model"""
    import urllib.request
    model_path.parent.mkdir(parents=True, exist_ok=True)
    
    urls = {
        'RealESRGAN_x4plus': 'https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus.pth',
        'RealESRGAN_x4plus_anime_6B': 'https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.2.4/RealESRGAN_x4plus_anime_6B.pth',
    }
    
    url = urls.get(MODEL_NAME)
    if not url:
        raise ValueError(f"Unknown model: {MODEL_NAME}")
    
    logger.info(f"Downloading model from {url}...")
    urllib.request.urlretrieve(url, model_path)
    logger.info(f"Model downloaded to {model_path}")

def load_model():
    """Load Real-ESRGAN model"""
    # Model path
    weights_dir = Path("weights")
    model_path = weights_dir / f"{MODEL_NAME}.pth"
    
    # Download if needed
    if not model_path.exists():
        logger.info(f"Model not found at {model_path}")
        download_model(model_path)
    
    # Select architecture
    if 'anime' in MODEL_NAME.lower():
        model = RRDBNet(num_in_ch=3, num_out_ch=3, num_feat=64, num_block=6, num_grow_ch=32, scale=4)
        netscale = 4
    elif 'x2' in MODEL_NAME.lower():
        model = RRDBNet(num_in_ch=3, num_out_ch=3, num_feat=64, num_block=23, num_grow_ch=32, scale=2)
        netscale = 2
    else:
        model = RRDBNet(num_in_ch=3, num_out_ch=3, num_feat=64, num_block=23, num_grow_ch=32, scale=4)
        netscale = 4
    
    # Determine GPU
    if USE_GPU:
        try:
            import torch
            gpu_id = 0 if torch.cuda.is_available() else None
        except ImportError:
            gpu_id = None
    else:
        gpu_id = None
    
    # Create upsampler
    upsampler = RealESRGANer(
        scale=netscale,
        model_path=str(model_path),
        model=model,
        tile=TILE_SIZE,
        tile_pad=TILE_PAD,
        pre_pad=PRE_PAD,
        half=USE_FP16,
        gpu_id=gpu_id
    )
    
    logger.info(f"Model loaded: {MODEL_NAME}")
    logger.info(f"GPU: {gpu_id is not None}, FP16: {USE_FP16}")
    logger.info(f"Tile: {TILE_SIZE}, Tile Pad: {TILE_PAD}, Pre Pad: {PRE_PAD}")
    
    return upsampler, netscale

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Initialize model
logger.info("Loading Real-ESRGAN model...")
upsampler, scale = load_model()
logger.info("Model loaded successfully!")

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    import torch
    return jsonify({
        'status': 'healthy',
        'model': MODEL_NAME,
        'gpu_available': torch.cuda.is_available() and upsampler.device.type == 'cuda'
    })

@app.route('/api/upscale', methods=['POST'])
def upscale_image():
    """
    Upscale image endpoint
    Accepts: multipart/form-data with 'image' file
    Returns: Enhanced image as PNG
    """
    try:
        # Get image from request
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': 'Empty filename'}), 400
        
        # Read and process image
        logger.info(f"Processing image: {file.filename}")
        
        # Open with PIL
        pil_image = Image.open(file.stream)
        logger.info(f"Original size: {pil_image.size}")
        
        # Convert to RGB if needed
        if pil_image.mode != 'RGB':
            pil_image = pil_image.convert('RGB')
        
        # Convert PIL to CV2
        cv2_image = pil_to_cv2(pil_image)
        
        # Upscale
        logger.info("Upscaling...")
        output, _ = upsampler.enhance(cv2_image, outscale=scale)
        
        # Convert back to PIL
        result_pil = cv2_to_pil(output)
        logger.info(f"Enhanced size: {result_pil.size}")
        
        # Save to buffer as PNG
        buffer = BytesIO()
        result_pil.save(buffer, format='PNG', optimize=True)
        buffer.seek(0)
        
        logger.info("Processing complete!")
        return send_file(
            buffer,
            mimetype='image/png',
            as_attachment=False,
            download_name='enhanced.png'
        )
        
    except Exception as e:
        logger.error(f"Error processing image: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500

@app.route('/', methods=['GET'])
def index():
    """API documentation"""
    return jsonify({
        'name': 'Image Enhancement API',
        'version': '1.0',
        'endpoints': {
            '/health': 'GET - Health check',
            '/api/upscale': 'POST - Upscale image (multipart/form-data with "image" field)'
        }
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
