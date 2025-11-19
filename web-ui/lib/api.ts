// API utilities for backend communication

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || '';

export async function uploadImage(file: File): Promise<{
  enhanced_url: string;
  job_id?: string;
}> {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('grading', 'none');

  const response = await fetch(`${BASE_URL}/api/upscale`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Upload failed: ' + (await response.text()));
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  
  return {
    enhanced_url: url,
  };
}

export async function compressImage(
  imageUrl: string,
  options: { quality: number; format?: string }
): Promise<Blob> {
  // Client-side compression using Canvas API
  // Always outputs PNG format for best quality
  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      const img = new Image();
      const imgUrl = URL.createObjectURL(blob);
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }
        
        ctx.drawImage(img, 0, 0);
        
        // Always use PNG format for best quality
        const format = 'image/png';
        
        canvas.toBlob(
          (compressedBlob) => {
            URL.revokeObjectURL(imgUrl);
            if (compressedBlob) {
              resolve(compressedBlob);
            } else {
              reject(new Error('Compression failed'));
            }
          },
          format,
          options.quality / 100
        );
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(imgUrl);
        reject(new Error('Image load failed'));
      };
      
      img.src = imgUrl;
    } catch (error) {
      reject(error);
    }
  });
}
