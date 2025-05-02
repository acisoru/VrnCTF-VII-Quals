// Define response types for our gRPC service
export interface CropResponse {
  imageData: string;
  message: string;
}

export interface FlagResponse {
  flag: string;
  message: string;
}

// Base URL for gRPC-web requests
const GRPC_WEB_URL = process.env.NEXT_PUBLIC_GRPC_WEB_URL || 'http://localhost:8080';

// API key for authentication
const API_KEY = 'sSG7kA2ir8pgw8pSfHUjVHBnz35YCM95';

export const imageService = {
  cropSquare: async (imageData: string, width: number = 300, height: number = 300): Promise<CropResponse> => {
    try {
      const requestData = {
        image_data: imageData,
        width: width,
        height: height,
        api_key: API_KEY
      };
      
      const response = await fetch(`${GRPC_WEB_URL}/imageservice.ImageService/CropSquare`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/grpc-web+json',
          'Accept': 'application/json',
          'x-grpc-web': '1'
        },
        body: JSON.stringify(requestData)
      });
      
      if (!response.ok) {
        console.error('cropSquare response not OK:', response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        imageData: data.imageData || '',
        message: data.message || 'Image processed successfully'
      };
    } catch (error) {
      console.error('Error in cropSquare:', error);
      throw error;
    }
  },

  cropCircular: async (imageData: string, width: number = 300, height: number = 300): Promise<CropResponse> => {
    try {
      const requestData = {
        image_data: imageData,
        width: width,
        height: height,
        api_key: API_KEY
      };
      
      const response = await fetch(`${GRPC_WEB_URL}/imageservice.ImageService/CropCircular`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/grpc-web+json',
          'Accept': 'application/json',
          'x-grpc-web': '1'
        },
        body: JSON.stringify(requestData)
      });
      
      if (!response.ok) {
        console.error('cropCircular response not OK:', response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        imageData: data.imageData || '',
        message: data.message || 'Image processed successfully'
      };
    } catch (error) {
      console.error('Error in cropCircular:', error);
      throw error;
    }
  },

  cropRhombus: async (imageData: string, width: number = 300, height: number = 300): Promise<CropResponse> => {
    try {
      const requestData = {
        image_data: imageData,
        width: width,
        height: height,
        api_key: API_KEY
      };
      
      const response = await fetch(`${GRPC_WEB_URL}/imageservice.ImageService/CropRhombus`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/grpc-web+json',
          'Accept': 'application/json',
          'x-grpc-web': '1'
        },
        body: JSON.stringify(requestData)
      });
      
      if (!response.ok) {
        console.error('cropRhombus response not OK:', response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        imageData: data.imageData || '',
        message: data.message || 'Image processed successfully'
      };
    } catch (error) {
      console.error('Error in cropRhombus:', error);
      throw error;
    }
  },
};
