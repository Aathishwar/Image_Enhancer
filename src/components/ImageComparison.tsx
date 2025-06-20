
import React, { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Download, RotateCcw } from 'lucide-react';

interface ImageComparisonProps {
  originalImage: string;
  enhancedImage?: string;
  isProcessing: boolean;
  onReset: () => void;
  onDownload: () => void;
}

const ImageComparison: React.FC<ImageComparisonProps> = ({
  originalImage,
  enhancedImage,
  isProcessing,
  onReset,
  onDownload
}) => {
  const [splitPosition, setSplitPosition] = useState(50);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Image Comparison</h3>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={onReset} size="sm">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button 
            onClick={onDownload} 
            disabled={!enhancedImage}
            size="sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </div>
      
      <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ height: '500px' }}>
        {/* Original Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url(${originalImage})`,
            clipPath: `polygon(0 0, ${splitPosition}% 0, ${splitPosition}% 100%, 0 100%)`
          }}
        />
        
        {/* Enhanced Image */}
        {enhancedImage && (
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
              backgroundImage: `url(${enhancedImage})`,
              clipPath: `polygon(${splitPosition}% 0, 100% 0, 100% 100%, ${splitPosition}% 100%)`
            }}
          />
        )}
        
        {/* Processing Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white p-4 rounded-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Enhancing with AI...</p>
            </div>
          </div>
        )}
        
        {/* Split Line */}
        <div 
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg"
          style={{ left: `${splitPosition}%` }}
        />
        
        {/* Labels */}
        <div className="absolute top-4 left-4 bg-black/70 text-white px-2 py-1 rounded text-sm">
          Original
        </div>
        {enhancedImage && (
          <div className="absolute top-4 right-4 bg-blue-500 text-white px-2 py-1 rounded text-sm">
            Enhanced
          </div>
        )}
      </div>
      
      {/* Split Control */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Comparison Split
        </label>
        <Slider
          value={[splitPosition]}
          onValueChange={(value) => setSplitPosition(value[0])}
          max={100}
          step={1}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default ImageComparison;
