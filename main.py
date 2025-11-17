"""
Image Enhancement Bot - Main Entry Point
"""
# Patch torchvision compatibility issue for Colab
import sys
try:
    import torchvision.transforms.functional as F
    
    class FunctionalTensorModule:
        @staticmethod
        def rgb_to_grayscale(img, num_output_channels=1):
            return F.rgb_to_grayscale(img, num_output_channels)
    
    sys.modules['torchvision.transforms.functional_tensor'] = FunctionalTensorModule()
except Exception:
    pass  # Ignore if torchvision not installed yet

from src.bot import main

if __name__ == '__main__':
    main()
