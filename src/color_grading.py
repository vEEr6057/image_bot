"""
Color grading and stylization module
"""
import cv2
import numpy as np
from enum import Enum


class ColorMapStyle(Enum):
    """Available OpenCV colormap styles"""
    NONE = 0
    AUTUMN = cv2.COLORMAP_AUTUMN
    BONE = cv2.COLORMAP_BONE
    JET = cv2.COLORMAP_JET
    WINTER = cv2.COLORMAP_WINTER
    RAINBOW = cv2.COLORMAP_RAINBOW
    OCEAN = cv2.COLORMAP_OCEAN
    SUMMER = cv2.COLORMAP_SUMMER
    SPRING = cv2.COLORMAP_SPRING
    COOL = cv2.COLORMAP_COOL
    HSV = cv2.COLORMAP_HSV
    PINK = cv2.COLORMAP_PINK
    HOT = cv2.COLORMAP_HOT
    PARULA = cv2.COLORMAP_PARULA
    MAGMA = cv2.COLORMAP_MAGMA
    INFERNO = cv2.COLORMAP_INFERNO
    PLASMA = cv2.COLORMAP_PLASMA
    VIRIDIS = cv2.COLORMAP_VIRIDIS
    CIVIDIS = cv2.COLORMAP_CIVIDIS
    TWILIGHT = cv2.COLORMAP_TWILIGHT
    TWILIGHT_SHIFTED = cv2.COLORMAP_TWILIGHT_SHIFTED
    TURBO = cv2.COLORMAP_TURBO
    DEEPGREEN = cv2.COLORMAP_DEEPGREEN


class ColorGrading:
    """Handle color grading and stylization effects"""
    
    @staticmethod
    def apply_colormap(img, colormap_style=ColorMapStyle.MAGMA, preserve_color=False):
        """
        Apply OpenCV colormap to image
        
        Args:
            img: Input image (BGR format)
            colormap_style: ColorMapStyle enum value
            preserve_color: If True, blend with original (50/50)
        
        Returns:
            Styled image (BGR format)
        """
        if colormap_style == ColorMapStyle.NONE:
            return img
        
        # Convert to grayscale for colormap application
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Apply colormap
        colored = cv2.applyColorMap(gray, colormap_style.value)
        
        # Optionally preserve some original color
        if preserve_color:
            colored = cv2.addWeighted(img, 0.5, colored, 0.5, 0)
        
        return colored
    
    @staticmethod
    def adjust_brightness_contrast(img, brightness=0, contrast=0):
        """
        Adjust brightness and contrast
        
        Args:
            img: Input image (BGR format)
            brightness: Brightness adjustment (-100 to 100)
            contrast: Contrast adjustment (-100 to 100)
        
        Returns:
            Adjusted image
        """
        if brightness == 0 and contrast == 0:
            return img
        
        # Convert adjustments to alpha (contrast) and beta (brightness)
        alpha = 1.0 + contrast / 100.0  # Simple contrast control (1.0-3.0)
        beta = brightness  # Simple brightness control (-100 to 100)
        
        # Apply adjustments
        adjusted = cv2.convertScaleAbs(img, alpha=alpha, beta=beta)
        return adjusted
    
    @staticmethod
    def adjust_saturation(img, saturation=0):
        """
        Adjust color saturation
        
        Args:
            img: Input image (BGR format)
            saturation: Saturation adjustment (-100 to 100)
        
        Returns:
            Adjusted image
        """
        if saturation == 0:
            return img
        
        # Convert to HSV
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV).astype(np.float32)
        
        # Adjust saturation
        hsv[:, :, 1] = hsv[:, :, 1] * (1 + saturation / 100.0)
        hsv[:, :, 1] = np.clip(hsv[:, :, 1], 0, 255)
        
        # Convert back to BGR
        hsv = hsv.astype(np.uint8)
        adjusted = cv2.cvtColor(hsv, cv2.COLOR_HSV2BGR)
        return adjusted
    
    @staticmethod
    def adjust_temperature(img, temperature=0):
        """
        Adjust color temperature (warm/cool)
        
        Args:
            img: Input image (BGR format)
            temperature: Temperature adjustment (-100=cooler, 100=warmer)
        
        Returns:
            Adjusted image
        """
        if temperature == 0:
            return img
        
        # Create adjustment matrix
        adjusted = img.copy().astype(np.float32)
        
        if temperature > 0:
            # Warmer: increase red, decrease blue
            adjusted[:, :, 2] = adjusted[:, :, 2] * (1 + temperature / 200.0)  # Red
            adjusted[:, :, 0] = adjusted[:, :, 0] * (1 - temperature / 200.0)  # Blue
        else:
            # Cooler: decrease red, increase blue
            adjusted[:, :, 2] = adjusted[:, :, 2] * (1 + temperature / 200.0)  # Red
            adjusted[:, :, 0] = adjusted[:, :, 0] * (1 - temperature / 200.0)  # Blue
        
        adjusted = np.clip(adjusted, 0, 255).astype(np.uint8)
        return adjusted
    
    @staticmethod
    def apply_vignette(img, strength=0.5):
        """
        Apply vignette effect (darkened corners)
        
        Args:
            img: Input image (BGR format)
            strength: Vignette strength (0.0 to 1.0)
        
        Returns:
            Image with vignette effect
        """
        if strength <= 0:
            return img
        
        rows, cols = img.shape[:2]
        
        # Create radial gradient mask
        X_resultant_kernel = cv2.getGaussianKernel(cols, cols / 2)
        Y_resultant_kernel = cv2.getGaussianKernel(rows, rows / 2)
        kernel = Y_resultant_kernel * X_resultant_kernel.T
        mask = kernel / kernel.max()
        
        # Apply strength
        mask = np.power(mask, strength)
        
        # Apply mask to each channel
        output = img.copy().astype(np.float32)
        for i in range(3):
            output[:, :, i] = output[:, :, i] * mask
        
        output = np.clip(output, 0, 255).astype(np.uint8)
        return output
    
    @staticmethod
    def sharpen(img, strength=1.0):
        """
        Sharpen image
        
        Args:
            img: Input image (BGR format)
            strength: Sharpening strength (0.0 to 2.0)
        
        Returns:
            Sharpened image
        """
        if strength <= 0:
            return img
        
        # Sharpening kernel
        kernel = np.array([[-1, -1, -1],
                          [-1,  9, -1],
                          [-1, -1, -1]]) * strength / 9.0
        kernel[1, 1] = kernel[1, 1] + (1 - strength)
        
        sharpened = cv2.filter2D(img, -1, kernel)
        return sharpened
    
    @staticmethod
    def apply_preset(img, preset_name):
        """
        Apply predefined color grading preset
        
        Args:
            img: Input image (BGR format)
            preset_name: Name of preset ('warm', 'cool', 'vibrant', 'cinematic', etc.)
        
        Returns:
            Styled image
        """
        presets = {
            'warm': lambda x: ColorGrading.adjust_temperature(
                ColorGrading.adjust_brightness_contrast(x, brightness=5, contrast=10),
                temperature=30
            ),
            'cool': lambda x: ColorGrading.adjust_temperature(
                ColorGrading.adjust_brightness_contrast(x, brightness=-5, contrast=10),
                temperature=-30
            ),
            'vibrant': lambda x: ColorGrading.sharpen(
                ColorGrading.adjust_saturation(
                    ColorGrading.adjust_brightness_contrast(x, contrast=20),
                    saturation=30
                ),
                strength=0.5
            ),
            'cinematic': lambda x: ColorGrading.apply_vignette(
                ColorGrading.adjust_brightness_contrast(x, brightness=-10, contrast=15),
                strength=0.7
            ),
            'vintage': lambda x: ColorGrading.adjust_saturation(
                ColorGrading.adjust_temperature(x, temperature=20),
                saturation=-20
            ),
            'magma': lambda x: ColorGrading.apply_colormap(x, ColorMapStyle.MAGMA),
            'plasma': lambda x: ColorGrading.apply_colormap(x, ColorMapStyle.PLASMA),
            'viridis': lambda x: ColorGrading.apply_colormap(x, ColorMapStyle.VIRIDIS),
            'turbo': lambda x: ColorGrading.apply_colormap(x, ColorMapStyle.TURBO),
        }
        
        preset_name = preset_name.lower()
        if preset_name not in presets:
            available = ', '.join(presets.keys())
            raise ValueError(f"Unknown preset '{preset_name}'. Available: {available}")
        
        return presets[preset_name](img)
