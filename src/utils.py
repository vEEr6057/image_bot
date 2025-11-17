"""
Utility functions for image processing and file handling
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
    
    Args:
        pil_image: PIL Image object
    
    Returns:
        numpy array in BGR format
    """
    # Convert PIL to RGB numpy array
    rgb_array = np.array(pil_image.convert('RGB'))
    
    # Convert RGB to BGR for OpenCV
    bgr_array = cv2.cvtColor(rgb_array, cv2.COLOR_RGB2BGR)
    
    return bgr_array


def cv2_to_pil(cv2_image):
    """
    Convert OpenCV format (BGR numpy array) to PIL Image
    
    Args:
        cv2_image: numpy array in BGR format
    
    Returns:
        PIL Image object
    """
    # Convert BGR to RGB
    rgb_array = cv2.cvtColor(cv2_image, cv2.COLOR_BGR2RGB)
    
    # Convert to PIL Image
    pil_image = Image.fromarray(rgb_array)
    
    return pil_image


def save_cv2_image(cv2_image, output_path, quality=95):
    """
    Save OpenCV image with quality settings
    
    Args:
        cv2_image: numpy array in BGR format
        output_path: Path to save image
        quality: JPEG quality (1-100) or PNG compression (0-9)
    """
    output_path = Path(output_path)
    
    if output_path.suffix.lower() in ['.jpg', '.jpeg']:
        cv2.imwrite(str(output_path), cv2_image, [cv2.IMWRITE_JPEG_QUALITY, quality])
    elif output_path.suffix.lower() == '.png':
        # PNG compression: 0-9 (0=no compression, 9=max compression)
        compression = 9 - int(quality / 11)  # Convert quality to compression level
        cv2.imwrite(str(output_path), cv2_image, [cv2.IMWRITE_PNG_COMPRESSION, compression])
    else:
        cv2.imwrite(str(output_path), cv2_image)


def check_image_size(image_path, max_pixels=10000*10000):
    """
    Check if image is within size limits
    
    Args:
        image_path: Path to image
        max_pixels: Maximum total pixels allowed
    
    Returns:
        Tuple of (is_valid, width, height, total_pixels)
    """
    try:
        img = Image.open(image_path)
        width, height = img.size
        total_pixels = width * height
        is_valid = total_pixels <= max_pixels
        return is_valid, width, height, total_pixels
    except Exception as e:
        return False, 0, 0, 0


def resize_if_too_large(image_path, max_pixels=10000*10000, output_path=None):
    """
    Resize image if it exceeds maximum pixel count
    
    Args:
        image_path: Path to input image
        max_pixels: Maximum total pixels allowed
        output_path: Path to save resized image (optional)
    
    Returns:
        Tuple of (was_resized, new_path)
    """
    is_valid, width, height, total_pixels = check_image_size(image_path, max_pixels)
    
    if is_valid:
        return False, image_path
    
    # Calculate resize ratio
    ratio = (max_pixels / total_pixels) ** 0.5
    new_width = int(width * ratio)
    new_height = int(height * ratio)
    
    # Resize image
    img = Image.open(image_path)
    resized = img.resize((new_width, new_height), Image.LANCZOS)
    
    # Save
    if output_path is None:
        output_path = image_path
    resized.save(output_path)
    
    return True, output_path


def get_file_size_mb(file_path):
    """Get file size in megabytes"""
    return Path(file_path).stat().st_size / (1024 * 1024)


def compress_for_telegram(image_path, max_size_mb=9.5, quality=95):
    """
    Compress image to meet Telegram's size requirements (10 MB for photos)
    
    Args:
        image_path: Path to image
        max_size_mb: Maximum file size in MB (default 9.5 for safety margin)
        quality: Initial quality setting
    
    Returns:
        Path to compressed image (may be same as input if no compression needed)
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
    
    # Try reducing quality first (faster than resizing)
    while file_size > max_size_mb and current_quality > 40:
        current_quality -= 10
        save_cv2_image(img, output_path, quality=current_quality)
        file_size = get_file_size_mb(output_path)
        print(f"Reduced quality to {current_quality}, size: {file_size:.1f} MB")
    
    # If still too large, resize progressively
    if file_size > max_size_mb:
        scale_factor = 0.9  # Reduce by 10% each iteration
        while file_size > max_size_mb and img.shape[0] > 500:  # Don't go too small
            new_width = int(img.shape[1] * scale_factor)
            new_height = int(img.shape[0] * scale_factor)
            img = cv2.resize(img, (new_width, new_height), interpolation=cv2.INTER_AREA)
            save_cv2_image(img, output_path, quality=max(current_quality, 70))
            file_size = get_file_size_mb(output_path)
            print(f"Resized to {new_width}×{new_height}, size: {file_size:.1f} MB")
    
    print(f"Final size: {file_size:.1f} MB")
    return output_path
