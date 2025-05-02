import { imageService as grpcImageService } from './grpcClient';

// Service for communicating with the backend
const API_KEY = 'sSG7kA2ir8pgw8pSfHUjVHBnz35YCM95';

export type CropShape = 'square' | 'circular' | 'rhombus';

export interface ImageResponse {
  image_data: Uint8Array | null;
  message: string;
}

export interface FlagResponse {
  flag: string;
  message: string;
}

// Crop an image with specified shape and dimensions
export async function cropImage(
  file: File,
  shape: CropShape,
  width: number,
  height: number
): Promise<ImageResponse> {
  const base64 = await fileToBase64(file);
  
  // Check if the image is too large and resize it if needed
  if (base64.length > 10000000) { // 10MB threshold
    console.warn('Image is very large, this may cause issues with gRPC message size limits');
  }
  
  try {
    let response;
    
    switch (shape) {
      case 'square':
        response = await grpcImageService.cropSquare(base64, width, height);
        break;
      case 'circular':
        response = await grpcImageService.cropCircular(base64, width, height);
        break;
      case 'rhombus':
        response = await grpcImageService.cropRhombus(base64, width, height);
        break;
      default:
        throw new Error('Invalid shape');
    }
    
    // Process response data
    let imageData: Uint8Array | null = null;
    if (response.imageData) {
      const binary = atob(response.imageData);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      imageData = bytes;
    } else {
      console.warn('No image data in response for shape:', shape);
    }
    
    return {
      image_data: imageData,
      message: response.message,
    };
  } catch (error) {
    console.error('Error processing image:', error);
    throw error;
  }
}

// Convert File to base64 string
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = error => reject(error);
  });
}
