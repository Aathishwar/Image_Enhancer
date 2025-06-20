
import React from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Users, Focus, Zap } from 'lucide-react';

interface EnhancementSettings {
  superResolution: number;
  faceEnhancement: number;
  deblurring: number;
  sharpening: number;
}

interface EnhancementControlsProps {
  settings: EnhancementSettings;
  onSettingsChange: (settings: EnhancementSettings) => void;
  onEnhance: () => void;
  isProcessing: boolean;
  hasImage: boolean;
}

const EnhancementControls: React.FC<EnhancementControlsProps> = ({
  settings,
  onSettingsChange,
  onEnhance,
  isProcessing,
  hasImage
}) => {
  const updateSetting = (key: keyof EnhancementSettings, value: number) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-blue-500" />
          <span>AI Enhancement</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="enhance" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="enhance">Enhance</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>
          
          <TabsContent value="enhance" className="space-y-6">
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Zap className="w-4 h-4 text-blue-500" />
                <label className="text-sm font-medium">Super Resolution</label>
                <span className="text-xs text-gray-500">({settings.superResolution}x)</span>
              </div>
              <Slider
                value={[settings.superResolution]}
                onValueChange={(value) => updateSetting('superResolution', value[0])}
                max={4}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1x</span>
                <span>2x</span>
                <span>4x</span>
              </div>
            </div>
            
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Users className="w-4 h-4 text-green-500" />
                <label className="text-sm font-medium">Face Enhancement</label>
                <span className="text-xs text-gray-500">({settings.faceEnhancement}%)</span>
              </div>
              <Slider
                value={[settings.faceEnhancement]}
                onValueChange={(value) => updateSetting('faceEnhancement', value[0])}
                max={100}
                min={0}
                step={10}
                className="w-full"
              />
            </div>
            
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Focus className="w-4 h-4 text-purple-500" />
                <label className="text-sm font-medium">Deblurring</label>
                <span className="text-xs text-gray-500">({settings.deblurring}%)</span>
              </div>
              <Slider
                value={[settings.deblurring]}
                onValueChange={(value) => updateSetting('deblurring', value[0])}
                max={100}
                min={0}
                step={10}
                className="w-full"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="advanced" className="space-y-6">
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Sparkles className="w-4 h-4 text-orange-500" />
                <label className="text-sm font-medium">Sharpening</label>
                <span className="text-xs text-gray-500">({settings.sharpening}%)</span>
              </div>
              <Slider
                value={[settings.sharpening]}
                onValueChange={(value) => updateSetting('sharpening', value[0])}
                max={100}
                min={0}
                step={10}
                className="w-full"
              />
            </div>
            
            <div className="bg-gray-50 p-3 rounded-lg">
              <h4 className="text-sm font-medium mb-2">Processing Info</h4>
              <div className="text-xs text-gray-600 space-y-1">
                <p>• Intel Iris GPU Acceleration</p>
                <p>• OpenVINO Optimization</p>
                <p>• Real-time Preview</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <Button 
          onClick={onEnhance}
          disabled={!hasImage || isProcessing}
          className="w-full mt-6"
          size="lg"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Enhance Image
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default EnhancementControls;
