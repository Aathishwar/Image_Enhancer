
import React, { useState } from 'react';
import { Sparkles, Settings, Info, Zap, Image, Cpu, Award, PenTool, Gauge, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

const Header: React.FC = () => {
  const [aboutOpen, setAboutOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="rounded-lg overflow-hidden flex items-center">
              <img src="/logo1.png" alt="Image Enhancer Logo" className="w-20 h-16 object-contain logo mt-1" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">AI Image Enhancer</h1>
              <p className="text-xs text-gray-500">Powered by Intel OpenVINO</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setAboutOpen(true)}>
              <Info className="w-4 h-4 mr-2" />
              About
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={aboutOpen} onOpenChange={setAboutOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Image className="w-6 h-6 text-blue-500" /> 
              AI Image Enhancer
            </DialogTitle>
            <DialogDescription>
              Transform low-quality images into crystal-clear visuals with advanced AI
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Key Features</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-start gap-2">
                  <Zap className="w-5 h-5 text-amber-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Super Resolution</p>
                    <p className="text-sm text-gray-500">Scale images up to 4x with incredible detail</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <PenTool className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Face Enhancement</p>
                    <p className="text-sm text-gray-500">Intelligently enhance facial features</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <Monitor className="w-5 h-5 text-purple-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Deblurring</p>
                    <p className="text-sm text-gray-500">Remove blur and restore clarity</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <Award className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Advanced Sharpening</p>
                    <p className="text-sm text-gray-500">Precise detail enhancement without artifacts</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-lg font-medium">Technology</h3>
              <div className="flex items-start gap-2">
                <Cpu className="w-5 h-5 text-red-500 mt-0.5" />
                <div>
                  <p className="font-medium">Intel OpenVINO & RealESRGAN</p>
                  <p className="text-sm text-gray-500">Hardware-accelerated AI processing for lightning-fast results</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Gauge className="w-5 h-5 text-indigo-500 mt-0.5" />
                <div>
                  <p className="font-medium">Optimized Performance</p>
                  <p className="text-sm text-gray-500">Tiled processing for memory-efficient enhancement of any image size</p>
                </div>
              </div>
            </div>
            
            <div className="pt-2 text-center text-sm text-gray-500">
              Created by <a href="https://example.com" className="text-blue-600 hover:underline hover:text-blue-800 transition-colors" target="_blank" rel="noopener noreferrer">Aathishwar</a>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default Header;
