"""
Flask API Server for Image Enhancement (Web UI Version)
Exposes Real-ESRGAN as HTTP endpoint with 15MB output limit
"""
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import logging
from io import BytesIO
from PIL import Image
import sys
import uuid
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

from src.super_resolution import SuperResolution
from src.utils_web import pil_to_cv2, cv2_to_pil, compress_to_target, generate_unique_filename

# Configure logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Initialize model
logger.info("Loading Real-ESRGAN model...")
sr_model = SuperResolution()
logger.info("Model loaded successfully!")

# Temp directory
TEMP_DIR = Path("temp_web")
TEMP_DIR.mkdir(exist_ok=True)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'model': 'Real-ESRGAN',
        'gpu_available': sr_model.upsampler.device.type == 'cuda'
    })

@app.route('/api/upscale', methods=['POST'])
def upscale_image():
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        logger.info(f"Processing image: {file.filename}")
        
        # Save input temporarily
        input_filename = generate_unique_filename('png')
        input_path = TEMP_DIR / input_filename
        file.save(input_path)
        
        # Upscale
        logger.info("Starting upscaling...")
        output_filename = f"upscaled_{input_filename}"
        output_path = TEMP_DIR / output_filename
        
        sr_model.upscale(input_path, output_path)
        
        # Compress to 15MB
        logger.info("Compressing output...")
        final_path = compress_to_target(output_path, max_size_mb=15.0)
        
        # Return image
        return send_file(
            final_path,
            mimetype='image/png',
            as_attachment=False,
            download_name='enhanced.png'
        )
    
    except Exception as e:
        logger.error(f"Error processing image: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500
    finally:
        # Cleanup could be added here, but for now we keep files for debugging/cache
        pass

def main():
    port = int(os.environ.get('PORT', 5000))
    logger.info(f"Starting Web API server on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=False)

if __name__ == '__main__':
    main()
