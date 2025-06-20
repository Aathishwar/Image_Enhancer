
import React, { useCallback } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  isProcessing?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, isProcessing }) => {
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    if (imageFile) {
      onImageUpload(imageFile);
    }
  }, [onImageUpload]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  }, [onImageUpload]);

  return (
    <div 
      className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-400 transition-colors"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <div className="flex flex-col items-center space-y-4">
        <div className="p-4 bg-blue-50 rounded-full">
          <ImageIcon className="w-8 h-8 text-blue-500" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Drop your image here
          </h3>
          <p className="text-gray-500 mb-4">
            Support for JPEG, PNG, and WEBP formats
          </p>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
            id="file-input"
            disabled={isProcessing}
          />
          <Button 
            variant="outline" 
            onClick={() => document.getElementById('file-input')?.click()}
            disabled={isProcessing}
            className="inline-flex items-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>Choose File</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ImageUploader;
