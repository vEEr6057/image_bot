"""
Utility functions for image processing and file handling (Web UI Version)
"""
import uuid
from pathlib import Path
from PIL import Image
import cv2
import numpy as np


def generate_unique_filename(extension='png'):
    """Generate unique filename using UUID"""
    return f"{uuid.uuid4().hex}.{extension}"


def pil_to_cv2(pil_image):
    """
    Convert PIL Image to OpenCV format (BGR numpy array)
    """
    rgb_array = np.array(pil_image.convert('RGB'))
    bgr_array = cv2.cvtColor(rgb_array, cv2.COLOR_RGB2BGR)
    return bgr_array


def cv2_to_pil(cv2_image):
    """
    Convert OpenCV format (BGR numpy array) to PIL Image
    """
    rgb_array = cv2.cvtColor(cv2_image, cv2.COLOR_BGR2RGB)
    pil_image = Image.fromarray(rgb_array)
    return pil_image


def save_cv2_image(cv2_image, output_path, quality=95):
    """
    Save OpenCV image with quality settings
    """
    output_path = Path(output_path)
    
    if output_path.suffix.lower() in ['.jpg', '.jpeg']:
        cv2.imwrite(str(output_path), cv2_image, [cv2.IMWRITE_JPEG_QUALITY, quality])
    elif output_path.suffix.lower() == '.png':
        # PNG compression: 0-9 (0=no compression, 9=max compression)
        compression = 9 - int(quality / 11)
        cv2.imwrite(str(output_path), cv2_image, [cv2.IMWRITE_PNG_COMPRESSION, compression])
    else:
        cv2.imwrite(str(output_path), cv2_image)


def get_file_size_mb(file_path):
    """Get file size in megabytes"""
    return Path(file_path).stat().st_size / (1024 * 1024)


def compress_to_target(image_path, max_size_mb=15.0, quality=95):
    """
    Compress image to meet strict size requirements (default 15 MB)
    
    Args:
        image_path: Path to image
        max_size_mb: Maximum file size in MB
        quality: Initial quality setting
    
    Returns:
        Path to compressed image
    """
    file_size = get_file_size_mb(image_path)
    
    if file_size <= max_size_mb:
        return image_path
    
    print(f"Image too large ({file_size:.1f} MB), compressing to under {max_size_mb} MB...")
    
    # Load image
    img = cv2.imread(str(image_path))
    if img is None:
        return image_path
    
    output_path = image_path
    current_quality = quality
    
    # Strategy 1: Reduce Quality (JPEG/PNG compression)
    while file_size > max_size_mb and current_quality > 50:
        current_quality -= 10
        save_cv2_image(img, output_path, quality=current_quality)
        file_size = get_file_size_mb(output_path)
        print(f"Reduced quality to {current_quality}, size: {file_size:.1f} MB")
    
    # Strategy 2: Resize (Downscale)
    if file_size > max_size_mb:
        scale_factor = 0.9
        while file_size > max_size_mb and img.shape[0] > 800:  # Don't go too small
            new_width = int(img.shape[1] * scale_factor)
            new_height = int(img.shape[0] * scale_factor)
            img = cv2.resize(img, (new_width, new_height), interpolation=cv2.INTER_AREA)
            save_cv2_image(img, output_path, quality=max(current_quality, 80))
            file_size = get_file_size_mb(output_path)
            print(f"Resized to {new_width}x{new_height}, size: {file_size:.1f} MB")
            
    print(f"Final size: {file_size:.1f} MB")
    return output_path
