export interface EnhancementSettings {
  superResolution: number;
  faceEnhancement: number;
  deblurring: number;
  sharpening: number;
}

export class ImageEnhancer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  async enhanceImage(imageUrl: string, settings: EnhancementSettings): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        // Set canvas size based on super resolution setting
        const scaleFactor = settings.superResolution;
        this.canvas.width = img.width * scaleFactor;
        this.canvas.height = img.height * scaleFactor;

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Enable image smoothing for better quality
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';

        // Draw scaled image
        this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);

        // Apply enhancement filters
        this.applyEnhancements(settings);

        // Convert to data URL
        const enhancedDataUrl = this.canvas.toDataURL('image/jpeg', 0.95);
        resolve(enhancedDataUrl);
      };
      img.src = imageUrl;
    });
  }

  private applyEnhancements(settings: EnhancementSettings) {
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;

    // Apply multi-stage denoising if enabled
    if (settings.deblurring > 0) {
      this.applyAdvancedDenoising(data, this.canvas.width, this.canvas.height, settings.deblurring / 100);
    }

    // Apply face enhancement (brightness and contrast boost)
    if (settings.faceEnhancement > 0) {
      this.applyBrightnessContrast(data, settings.faceEnhancement / 100);
    }

    // Apply adaptive sharpening last to enhance details
    if (settings.sharpening > 0) {
      this.applyAdaptiveSharpening(data, this.canvas.width, this.canvas.height, settings.sharpening / 100);
    }

    this.ctx.putImageData(imageData, 0, 0);
  }

  private applyAdvancedDenoising(data: Uint8ClampedArray, width: number, height: number, intensity: number) {
    // Create a copy for processing
    const originalData = new Uint8ClampedArray(data);
    
    // Stage 1: Non-local means denoising for texture preservation
    this.applyNonLocalMeansDenoising(data, originalData, width, height, intensity);
    
    // Stage 2: Bilateral filter for edge-preserving smoothing
    const intermediateData = new Uint8ClampedArray(data);
    this.applyImprovedBilateralFilter(data, intermediateData, width, height, intensity);
    
    // Stage 3: Selective median filter for impulse noise
    if (intensity > 0.3) {
      this.applySelectiveMedianFilter(data, width, height, intensity);
    }

    // Stage 4: Wavelet-like denoising simulation
    if (intensity > 0.6) {
      this.applyWaveletDenoising(data, width, height, intensity);
    }
  }

  private applyNonLocalMeansDenoising(data: Uint8ClampedArray, originalData: Uint8ClampedArray, width: number, height: number, intensity: number) {
    const searchRadius = Math.max(3, Math.floor(intensity * 8));
    const patchRadius = Math.max(1, Math.floor(intensity * 3));
    const h = 10 + intensity * 20; // Filtering strength

    for (let y = searchRadius; y < height - searchRadius; y++) {
      for (let x = searchRadius; x < width - searchRadius; x++) {
        for (let c = 0; c < 3; c++) { // RGB channels
          let weightSum = 0;
          let pixelSum = 0;
          const centerPixel = (y * width + x) * 4 + c;

          // Search in neighborhood
          for (let sy = -searchRadius; sy <= searchRadius; sy += 2) {
            for (let sx = -searchRadius; sx <= searchRadius; sx += 2) {
              const ny = y + sy;
              const nx = x + sx;
              
              if (ny >= patchRadius && ny < height - patchRadius && 
                  nx >= patchRadius && nx < width - patchRadius) {
                
                // Calculate patch similarity
                let patchDiff = 0;
                let patchCount = 0;
                
                for (let py = -patchRadius; py <= patchRadius; py++) {
                  for (let px = -patchRadius; px <= patchRadius; px++) {
                    const p1 = ((y + py) * width + (x + px)) * 4 + c;
                    const p2 = ((ny + py) * width + (nx + px)) * 4 + c;
                    patchDiff += Math.pow(originalData[p1] - originalData[p2], 2);
                    patchCount++;
                  }
                }
                
                const patchDistance = patchDiff / patchCount;
                const weight = Math.exp(-patchDistance / (h * h));
                
                const neighborPixel = (ny * width + nx) * 4 + c;
                weightSum += weight;
                pixelSum += originalData[neighborPixel] * weight;
              }
            }
          }

          if (weightSum > 0) {
            const filteredValue = pixelSum / weightSum;
            data[centerPixel] = Math.round(originalData[centerPixel] * (1 - intensity * 0.7) + filteredValue * intensity * 0.7);
          }
        }
      }
    }
  }

  private applyImprovedBilateralFilter(data: Uint8ClampedArray, originalData: Uint8ClampedArray, width: number, height: number, intensity: number) {
    const radius = Math.max(2, Math.floor(intensity * 5));
    const sigmaColor = 30 + intensity * 40;
    const sigmaSpace = 30 + intensity * 40;

    for (let y = radius; y < height - radius; y++) {
      for (let x = radius; x < width - radius; x++) {
        for (let c = 0; c < 3; c++) { // RGB channels
          let weightSum = 0;
          let pixelSum = 0;
          const centerPixel = (y * width + x) * 4 + c;
          const centerValue = originalData[centerPixel];

          // Adaptive sampling based on local variance
          const localVariance = this.calculateLocalVariance(originalData, x, y, width, height, c, radius);
          const adaptiveStep = localVariance > 100 ? 1 : 2; // Denser sampling in high-variance areas

          for (let dy = -radius; dy <= radius; dy += adaptiveStep) {
            for (let dx = -radius; dx <= radius; dx += adaptiveStep) {
              const ny = y + dy;
              const nx = x + dx;
              const neighborPixel = (ny * width + nx) * 4 + c;
              const neighborValue = originalData[neighborPixel];

              // Improved spatial weight with Gaussian kernel
              const spatialDist = Math.sqrt(dx * dx + dy * dy);
              const spatialWeight = Math.exp(-(spatialDist * spatialDist) / (2 * sigmaSpace * sigmaSpace));

              // Enhanced color weight with edge detection
              const colorDist = Math.abs(centerValue - neighborValue);
              const edgeStrength = this.calculateEdgeStrength(originalData, nx, ny, width, height, c);
              const adaptedSigmaColor = sigmaColor * (1 + edgeStrength * 0.5);
              const colorWeight = Math.exp(-(colorDist * colorDist) / (2 * adaptedSigmaColor * adaptedSigmaColor));

              const weight = spatialWeight * colorWeight;
              weightSum += weight;
              pixelSum += neighborValue * weight;
            }
          }

          if (weightSum > 0) {
            const filteredValue = pixelSum / weightSum;
            data[centerPixel] = Math.round(centerValue * (1 - intensity * 0.6) + filteredValue * intensity * 0.6);
          }
        }
      }
    }
  }

  private calculateLocalVariance(data: Uint8ClampedArray, x: number, y: number, width: number, height: number, channel: number, radius: number): number {
    let sum = 0;
    let sumSquared = 0;
    let count = 0;

    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const ny = y + dy;
        const nx = x + dx;
        if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
          const pixel = (ny * width + nx) * 4 + channel;
          const value = data[pixel];
          sum += value;
          sumSquared += value * value;
          count++;
        }
      }
    }

    const mean = sum / count;
    const variance = (sumSquared / count) - (mean * mean);
    return variance;
  }

  private calculateEdgeStrength(data: Uint8ClampedArray, x: number, y: number, width: number, height: number, channel: number): number {
    if (x <= 0 || x >= width - 1 || y <= 0 || y >= height - 1) return 0;

    // Sobel edge detection
    const sobelX = [
      [-1, 0, 1],
      [-2, 0, 2],
      [-1, 0, 1]
    ];
    
    const sobelY = [
      [-1, -2, -1],
      [0, 0, 0],
      [1, 2, 1]
    ];

    let gx = 0, gy = 0;
    
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const pixel = ((y + dy) * width + (x + dx)) * 4 + channel;
        const value = data[pixel];
        gx += value * sobelX[dy + 1][dx + 1];
        gy += value * sobelY[dy + 1][dx + 1];
      }
    }

    return Math.sqrt(gx * gx + gy * gy) / 255;
  }

  private applySelectiveMedianFilter(data: Uint8ClampedArray, width: number, height: number, intensity: number) {
    const originalData = new Uint8ClampedArray(data);
    const kernelSize = 3;
    const offset = Math.floor(kernelSize / 2);
    const threshold = 20 + intensity * 30; // Threshold for noise detection

    for (let y = offset; y < height - offset; y++) {
      for (let x = offset; x < width - offset; x++) {
        for (let c = 0; c < 3; c++) { // RGB channels
          const centerPixel = (y * width + x) * 4 + c;
          const centerValue = originalData[centerPixel];
          
          // Check if pixel is likely noise by comparing with neighbors
          let neighborSum = 0;
          let neighborCount = 0;
          
          for (let dy = -offset; dy <= offset; dy++) {
            for (let dx = -offset; dx <= offset; dx++) {
              if (dx !== 0 || dy !== 0) {
                const pixel = ((y + dy) * width + (x + dx)) * 4 + c;
                neighborSum += originalData[pixel];
                neighborCount++;
              }
            }
          }
          
          const neighborAvg = neighborSum / neighborCount;
          const deviation = Math.abs(centerValue - neighborAvg);
          
          // Apply median filter only if pixel deviates significantly
          if (deviation > threshold) {
            const values: number[] = [];
            
            for (let dy = -offset; dy <= offset; dy++) {
              for (let dx = -offset; dx <= offset; dx++) {
                const pixel = ((y + dy) * width + (x + dx)) * 4 + c;
                values.push(originalData[pixel]);
              }
            }
            
            values.sort((a, b) => a - b);
            const median = values[Math.floor(values.length / 2)];
            
            // Blend median with original based on deviation strength
            const blendFactor = Math.min(1, deviation / (threshold * 2)) * intensity;
            data[centerPixel] = Math.round(centerValue * (1 - blendFactor) + median * blendFactor);
          }
        }
      }
    }
  }

  private applyWaveletDenoising(data: Uint8ClampedArray, width: number, height: number, intensity: number) {
    // Simplified wavelet-like denoising using multi-scale processing
    const scales = [2, 4, 8];
    const threshold = intensity * 15;

    for (const scale of scales) {
      if (scale >= Math.min(width, height) / 4) continue;

      const scaledData = new Uint8ClampedArray(data);
      
      for (let y = scale; y < height - scale; y += scale) {
        for (let x = scale; x < width - scale; x += scale) {
          for (let c = 0; c < 3; c++) {
            // Calculate local mean at current scale
            let sum = 0;
            let count = 0;
            
            for (let dy = -scale; dy <= scale; dy += Math.max(1, scale / 2)) {
              for (let dx = -scale; dx <= scale; dx += Math.max(1, scale / 2)) {
                const ny = y + dy;
                const nx = x + dx;
                if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
                  const pixel = (ny * width + nx) * 4 + c;
                  sum += data[pixel];
                  count++;
                }
              }
            }
            
            const localMean = sum / count;
            
            // Apply soft thresholding
            for (let dy = -scale; dy <= scale; dy++) {
              for (let dx = -scale; dx <= scale; dx++) {
                const ny = y + dy;
                const nx = x + dx;
                if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
                  const pixel = (ny * width + nx) * 4 + c;
                  const diff = data[pixel] - localMean;
                  
                  if (Math.abs(diff) < threshold) {
                    const sign = diff >= 0 ? 1 : -1;
                    const newDiff = Math.max(0, Math.abs(diff) - threshold * 0.5) * sign;
                    scaledData[pixel] = Math.round(localMean + newDiff);
                  }
                }
              }
            }
          }
        }
      }
      
      // Blend with original
      const blendFactor = 0.3 * intensity / scales.length;
      for (let i = 0; i < data.length; i += 4) {
        for (let c = 0; c < 3; c++) {
          data[i + c] = Math.round(data[i + c] * (1 - blendFactor) + scaledData[i + c] * blendFactor);
        }
      }
    }
  }

  private applyAdaptiveSharpening(data: Uint8ClampedArray, width: number, height: number, intensity: number) {
    const newData = new Uint8ClampedArray(data);

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        for (let c = 0; c < 3; c++) { // RGB channels only
          const centerPixel = (y * width + x) * 4 + c;
          const centerValue = data[centerPixel];
          
          // Calculate local edge strength for adaptive sharpening
          const edgeStrength = this.calculateEdgeStrength(data, x, y, width, height, c);
          const adaptiveIntensity = intensity * (0.5 + edgeStrength * 0.5);
          
          // Unsharp masking with adaptive kernel
          const sharpenKernel = [
            0, -adaptiveIntensity * 0.5, 0,
            -adaptiveIntensity * 0.5, 1 + 2 * adaptiveIntensity, -adaptiveIntensity * 0.5,
            0, -adaptiveIntensity * 0.5, 0
          ];

          let sum = 0;
          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              const pixel = ((y + ky) * width + (x + kx)) * 4 + c;
              const kernelIndex = (ky + 1) * 3 + (kx + 1);
              sum += data[pixel] * sharpenKernel[kernelIndex];
            }
          }
          
          // Prevent over-sharpening by clamping
          newData[centerPixel] = Math.max(0, Math.min(255, sum));
        }
      }
    }

    // Copy back the enhanced data
    for (let i = 0; i < data.length; i += 4) {
      data[i] = newData[i];     // R
      data[i + 1] = newData[i + 1]; // G
      data[i + 2] = newData[i + 2]; // B
      // Keep alpha unchanged
    }
  }

  private applyBrightnessContrast(data: Uint8ClampedArray, intensity: number) {
    const brightness = intensity * 15; // Reduced brightness adjustment
    const contrast = 1 + intensity * 0.3; // Reduced contrast multiplier

    for (let i = 0; i < data.length; i += 4) {
      // Apply contrast and brightness to RGB channels
      data[i] = Math.max(0, Math.min(255, (data[i] - 128) * contrast + 128 + brightness));     // R
      data[i + 1] = Math.max(0, Math.min(255, (data[i + 1] - 128) * contrast + 128 + brightness)); // G
      data[i + 2] = Math.max(0, Math.min(255, (data[i + 2] - 128) * contrast + 128 + brightness)); // B
      // Keep alpha unchanged
    }
  }
}
