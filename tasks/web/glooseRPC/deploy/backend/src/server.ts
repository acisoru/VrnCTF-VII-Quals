import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import sharp from 'sharp';

// Load the proto definition
const PROTO_PATH = process.env.NODE_ENV === 'production' ? '/proto/image_service.proto' : path.resolve(__dirname, '../../proto/image_service.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
const imageService = protoDescriptor.imageservice as any;

// CTF challenge secrets
const FLAG = 'vrnctf{Gl00s3_RPC_just_w4nt3d_y0u_to_int3rcept_1t}';
const SECRET_KEY = 'sSG7kA2ir8pgw8pSfHUjVHBnz35YCM95';

// Implementation of the service
const server = new grpc.Server({
  'grpc.max_receive_message_length': 600 * 1024 * 1024, // 600MB
  'grpc.max_send_message_length': 600 * 1024 * 1024, // 600MB
});

server.addService(imageService.ImageService.service, {
  // Crop an image to a square shape
  cropSquare: async (call: grpc.ServerUnaryCall<any, any>, callback: grpc.sendUnaryData<any>) => {
    try {
      const { image_data, width, height, api_key } = call.request;
      
      // Validate API key
      if (api_key !== SECRET_KEY) {
        callback({
          code: grpc.status.PERMISSION_DENIED,
          message: 'Invalid API key'
        });
        return;
      }
      
      // Convert buffer back from base64 if needed
      const imageBuffer = Buffer.from(image_data);
      
      // Process image with sharp
      const processedImage = await sharp(imageBuffer)
        .resize(width, height, { fit: 'cover' })
        .toBuffer();
      
      callback(null, {
        image_data: processedImage,
        message: 'Image cropped to square successfully'
      });
    } catch (error) {
      console.error('Error processing square crop:', error);
      callback({
        code: grpc.status.INTERNAL,
        message: 'Error processing image'
      });
    }
  },
  
  // Crop an image to a circular shape
  cropCircular: async (call: grpc.ServerUnaryCall<any, any>, callback: grpc.sendUnaryData<any>) => {
    try {
      const { image_data, width, height, api_key } = call.request;
      
      // Validate API key
      if (api_key !== SECRET_KEY) {
        callback({
          code: grpc.status.PERMISSION_DENIED,
          message: 'Invalid API key'
        });
        return;
      }
      
      // Convert buffer back from base64 if needed
      const imageBuffer = Buffer.from(image_data);
      
      // Create a circular mask and apply it
      const processedImage = await sharp(imageBuffer)
        .resize(width, height, { fit: 'cover' })
        .composite([{
          input: Buffer.from(
            '<svg><circle cx="' + width/2 + '" cy="' + height/2 + 
            '" r="' + Math.min(width, height)/2 + '" /></svg>'
          ),
          blend: 'dest-in'
        }])
        .toBuffer();
      
      callback(null, {
        image_data: processedImage,
        message: 'Image cropped to circle successfully'
      });
    } catch (error) {
      console.error('Error processing circular crop:', error);
      callback({
        code: grpc.status.INTERNAL,
        message: 'Error processing image'
      });
    }
  },
  
  // Crop an image to a rhombus shape
  cropRhombus: async (call: grpc.ServerUnaryCall<any, any>, callback: grpc.sendUnaryData<any>) => {
    try {
      const { image_data, width, height, api_key } = call.request;
      
      // Validate API key
      if (api_key !== SECRET_KEY) {
        callback({
          code: grpc.status.PERMISSION_DENIED,
          message: 'Invalid API key'
        });
        return;
      }
      
      // Convert buffer back from base64 if needed
      const imageBuffer = Buffer.from(image_data);
      
      // Create a rhombus mask and apply it
      const processedImage = await sharp(imageBuffer)
        .resize(width, height, { fit: 'cover' })
        .composite([{
          input: Buffer.from(
            '<svg><polygon points="' + 
            width/2 + ',0 ' + 
            width + ',' + height/2 + ' ' + 
            width/2 + ',' + height + ' ' + 
            '0,' + height/2 + '" /></svg>'
          ),
          blend: 'dest-in'
        }])
        .toBuffer();
      
      callback(null, {
        image_data: processedImage,
        message: 'Image cropped to rhombus successfully'
      });
    } catch (error) {
      console.error('Error processing rhombus crop:', error);
      callback({
        code: grpc.status.INTERNAL,
        message: 'Error processing image'
      });
    }
  },
  
  // Hidden flag endpoint for CTF
  getFlag: (call: grpc.ServerUnaryCall<any, any>, callback: grpc.sendUnaryData<any>) => {
    const { api_key } = call.request;
    
    // Validate API key
    if (api_key === SECRET_KEY) {
      callback(null, {
        flag: FLAG,
        message: 'Congratulations! You found the hidden method!'
      });
    } else {
      callback(null, {
        flag: '',
        message: 'Nice try, but the secret key is incorrect!'
      });
    }
  }
});

// Start the gRPC server
const serverAddress = '0.0.0.0:50051';
server.bindAsync(
  serverAddress,
  grpc.ServerCredentials.createInsecure(),
  (error: Error | null, port: number) => {
    if (error) {
      console.error('Failed to bind server:', error);
      return;
    }
    
    server.start();
    console.log(`Server running at ${serverAddress}`);
  }
);
