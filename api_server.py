"""
Flask API Server for Image Enhancement
Exposes Real-ESRGAN as HTTP endpoint for web UI
"""
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import logging
from io import BytesIO
from PIL import Image
import sys

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
from src.utils import pil_to_cv2, cv2_to_pil

# Configure logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize model (do this once on startup)
logger.info("Loading Real-ESRGAN model...")
sr_model = SuperResolution()
logger.info("Model loaded successfully!")

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model': 'Real-ESRGAN',
        'gpu_available': sr_model.upsampler.device.type == 'cuda'
    })

@app.route('/api/upscale', methods=['POST'])
def upscale_image():
    """
    Upscale image endpoint
    Accepts: multipart/form-data with 'image' file
    Returns: Enhanced image as PNG
    """
    try:
        # Check if image is in request
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400
        
        file = request.files['image']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Read image
        logger.info(f"Processing image: {file.filename}")
        image_bytes = file.read()
        input_image = Image.open(BytesIO(image_bytes))
        
        # Convert to RGB if necessary
        if input_image.mode != 'RGB':
            input_image = input_image.convert('RGB')
        
        # Convert PIL to CV2
        cv2_image = pil_to_cv2(input_image)
        
        # Upscale
        logger.info("Starting upscaling...")
        upscaled_cv2 = sr_model.upscale(cv2_image)
        
        # Convert back to PIL
        output_image = cv2_to_pil(upscaled_cv2)
        
        # Save to BytesIO
        output_buffer = BytesIO()
        output_image.save(output_buffer, format='PNG', optimize=True)
        output_buffer.seek(0)
        
        logger.info(f"Upscaling complete. Output size: {output_image.size}")
        
        # Return image
        return send_file(
            output_buffer,
            mimetype='image/png',
            as_attachment=False,
            download_name='upscaled.png'
        )
    
    except Exception as e:
        logger.error(f"Error processing image: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500

@app.route('/', methods=['GET'])
def index():
    """Root endpoint"""
    return jsonify({
        'service': 'Image Enhancement API',
        'version': '1.0',
        'endpoints': {
            '/health': 'GET - Health check',
            '/api/upscale': 'POST - Upscale image (multipart/form-data)',
        }
    })

def main():
    """Run Flask server"""
    port = int(os.environ.get('PORT', 5000))
    logger.info(f"Starting Flask server on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=False)

if __name__ == '__main__':
    main()
