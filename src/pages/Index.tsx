import React, { useState } from 'react';
import Header from '@/components/Header';
import ImageUploader from '@/components/ImageUploader';
import ImageComparison from '@/components/ImageComparison';
import EnhancementControls from '@/components/EnhancementControls';
import { toast } from 'sonner';

interface EnhancementSettings {
  superResolution: number;
  faceEnhancement: number;
  deblurring: number;
  sharpening: number;
}

const Index = () => {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [settings, setSettings] = useState<EnhancementSettings>({
    superResolution: 2,
    faceEnhancement: 50,
    deblurring: 30,
    sharpening: 20
  });

  const handleImageUpload = (file: File) => {
    setOriginalFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setOriginalImage(result);
      setEnhancedImage(null);
    };
    reader.readAsDataURL(file);

    toast.success(`Image uploaded: ${file.name}`);
    console.log('Image uploaded:', file.name, 'Size:', file.size, 'bytes');
  };

  const handleEnhance = async () => {
    if (!originalFile) return;

    setIsProcessing(true);
    try {
      console.log('Starting enhancement with:', settings);

      const formData = new FormData();
      formData.append('file', originalFile);
      formData.append('denoise', settings.deblurring.toString());
      formData.append('face_enhance', settings.faceEnhancement.toString());
      formData.append('scale', settings.superResolution.toString());
      formData.append('sharpen', settings.sharpening.toString());
      formData.append('tile_size', '512');
      formData.append('overlap', '32');
      formData.append('device', 'GPU');

      // Use the Vite proxy for API calls
      const res = await fetch('/api/enhance/', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error('Enhancement failed');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setEnhancedImage(url);

      toast.success('Image enhanced successfully!');
      console.log('Enhancement completed.');
    } catch (error) {
      console.error('Enhancement failed:', error);
      toast.error('Enhancement failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setOriginalFile(null);
    setOriginalImage(null);
    setEnhancedImage(null);
    setIsProcessing(false);
    toast.info('Reset completed');
  };

  const handleDownload = () => {
    if (enhancedImage) {
      const link = document.createElement('a');
      link.href = enhancedImage;
      link.download = 'enhanced-image.jpg';
      link.click();
      toast.success('Image downloaded');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Controls */}
          <div className="lg:col-span-1">
            <EnhancementControls
              settings={settings}
              onSettingsChange={setSettings}
              onEnhance={handleEnhance}
              isProcessing={isProcessing}
              hasImage={!!originalImage}
            />
          </div>

          {/* Right Column - Image Processing */}
          <div className="lg:col-span-2 space-y-6">
            {!originalImage ? (
              <ImageUploader
                onImageUpload={handleImageUpload}
                isProcessing={isProcessing}
              />
            ) : (
              <ImageComparison
                originalImage={originalImage}
                enhancedImage={enhancedImage}
                isProcessing={isProcessing}
                onReset={handleReset}
                onDownload={handleDownload}
              />
            )}

            {/* Tech Stack Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Technology Stack</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900">Frontend</h4>
                  <p className="text-sm text-blue-700">React + Tailwind</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900">AI Engine</h4>
                  <p className="text-sm text-green-700">OpenVINO + RealESRGAN</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-medium text-purple-900">GPU</h4>
                  <p className="text-sm text-purple-700">Intel Iris</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
