'use client';

import { useState, useRef, useEffect, ChangeEvent } from 'react';
import Image from 'next/image';
import { cropImage } from '@/lib/imageService';

type CropShape = 'square' | 'circular' | 'rhombus';

export default function Home() {
  // Component initialization
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 300, height: 300 });
  const fileInputRef = useRef<HTMLInputElement>(null);



  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setResultUrl(null);
      setError(null);
    }
  };

  const handleCrop = async (shape: CropShape) => {
    if (!selectedFile) {
      setError('Please select an image first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await cropImage(selectedFile, shape, dimensions.width, dimensions.height);
      
      if (result.image_data) {
        // Convert the binary data to a Blob and create a URL for it
        const blob = new Blob([result.image_data], { type: 'image/png' });
        const url = URL.createObjectURL(blob);
        setResultUrl(url);
      } else {
        throw new Error('No image data returned');
      }
    } catch (err) {
      console.error('Error cropping image:', err);
      setError('Failed to process image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDimensionChange = (e: ChangeEvent<HTMLInputElement>, dimension: 'width' | 'height') => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setDimensions(prev => ({ ...prev, [dimension]: value }));
    }
  };

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-8 text-center">GlooseRPC</h1>
      
      <div className="w-full max-w-4xl bg-slate-800 rounded-lg p-6 shadow-lg">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Upload an Image</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => fileInputRef.current?.click()} 
              className="btn btn-primary"
            >
              Select Image
            </button>
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
              className="hidden"
            />
            {selectedFile && (
              <p className="text-slate-300">
                Selected: {selectedFile.name}
              </p>
            )}
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Dimensions</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <div>
              <label htmlFor="width" className="block mb-2">Width (px)</label>
              <input
                id="width"
                type="number"
                value={dimensions.width}
                onChange={(e) => handleDimensionChange(e, 'width')}
                className="input-field w-full sm:w-32"
                min="1"
              />
            </div>
            <div>
              <label htmlFor="height" className="block mb-2">Height (px)</label>
              <input
                id="height"
                type="number"
                value={dimensions.height}
                onChange={(e) => handleDimensionChange(e, 'height')}
                className="input-field w-full sm:w-32"
                min="1"
              />
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Crop Options</h2>
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => handleCrop('square')} 
              className="btn btn-primary"
              disabled={loading || !selectedFile}
            >
              Crop Square
            </button>
            <button 
              onClick={() => handleCrop('circular')} 
              className="btn btn-primary"
              disabled={loading || !selectedFile}
            >
              Crop Circular
            </button>
            <button 
              onClick={() => handleCrop('rhombus')} 
              className="btn btn-primary"
              disabled={loading || !selectedFile}
            >
              Crop Rhombus
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-md text-red-200">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {previewUrl && (
            <div>
              <h3 className="text-lg font-medium mb-3">Original Image</h3>
              <div className="relative aspect-square w-full max-w-md mx-auto bg-slate-900 rounded-md overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="object-contain w-full h-full"
                />
              </div>
            </div>
          )}

          {resultUrl && (
            <div>
              <h3 className="text-lg font-medium mb-3">Processed Image</h3>
              <div className="relative aspect-square w-full max-w-md mx-auto bg-slate-900 rounded-md overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={resultUrl} 
                  alt="Result" 
                  className="object-contain w-full h-full"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 text-center text-slate-400 text-sm">
        <p>GlooseRPC - Image Processing Service</p>
        <p className="mt-1">Can you find the hidden functionality?</p>
      </div>
    </div>
  );
}
