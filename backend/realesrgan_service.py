# backend/realesrgan_service.py
import cv2, numpy as np, time, os
from openvino import Core
from tqdm import tqdm


def preprocess_tile(tile):
    # Convert to float32 and normalize to 0-1 range
    tile_float = tile.astype(np.float32) / 255.0
    # Transpose from HWC to CHW format
    tile_chw = np.transpose(tile_float, (2, 0, 1))
    # Add batch dimension
    tile_nchw = np.expand_dims(tile_chw, 0)
    return tile_nchw

def postprocess_tile(output):
    output = np.squeeze(output)
    output = np.clip(output, 0, 1)
    output = np.transpose(output, (1, 2, 0)) * 255
    return output.astype(np.uint8)

def enhance_image_tiled(image, compiled_model, output_layer, tile_size=512, overlap=32, scale=4):
    """Process image by tiles to avoid GPU memory issues"""
    # Get image dimensions
    h, w, c = image.shape
    
    # Calculate output dimensions
    output_h, output_w = h * scale, w * scale
    
    # Create empty output image
    output_image = np.zeros((output_h, output_w, c), dtype=np.uint8)
    
    # Calculate effective tile dimensions considering overlap
    effective_tile_size = tile_size - 2 * overlap
    
    # Calculate number of tiles in each dimension
    num_tiles_h = max(1, int(np.ceil(h / effective_tile_size)))
    num_tiles_w = max(1, int(np.ceil(w / effective_tile_size)))
    
    total_tiles = num_tiles_h * num_tiles_w
    print(f"[INFO] Processing image in {total_tiles} tiles ({num_tiles_h}x{num_tiles_w})")
    
    # Process each tile
    with tqdm(total=total_tiles, desc="Processing tiles") as pbar:
        for i in range(num_tiles_h):
            for j in range(num_tiles_w):
                # Calculate tile coordinates with overlap
                x_start = max(0, j * effective_tile_size - overlap)
                y_start = max(0, i * effective_tile_size - overlap)
                x_end = min(w, (j + 1) * effective_tile_size + overlap)
                y_end = min(h, (i + 1) * effective_tile_size + overlap)
                
                # Extract tile
                tile = image[y_start:y_end, x_start:x_end]
                
                # Preprocess tile
                tile_input = preprocess_tile(tile)
                
                # Run inference
                tile_output = compiled_model([tile_input])[output_layer]
                
                # Postprocess result
                tile_result = postprocess_tile(tile_output)
                
                # Calculate coordinates in output image
                out_x_start = x_start * scale
                out_y_start = y_start * scale
                out_x_end = x_end * scale
                out_y_end = y_end * scale
                
                # Get dimensions of the tile result and make sure they match expected dimensions
                tile_h, tile_w = tile_result.shape[:2]
                expected_h = (y_end - y_start) * scale
                expected_w = (x_end - x_start) * scale
                
                # Safety check to avoid dimension mismatch
                if tile_h != expected_h or tile_w != expected_w:
                    print(f"Warning: Tile size mismatch. Expected: {expected_h}x{expected_w}, Got: {tile_h}x{tile_w}")
                    # Resize to expected dimensions if there's a mismatch
                    tile_result = cv2.resize(tile_result, (expected_w, expected_h))
                
                # Calculate valid region (removing overlap) for output
                valid_x_start = 0 if j == 0 else overlap * scale
                valid_y_start = 0 if i == 0 else overlap * scale
                valid_x_end = min(tile_result.shape[1], expected_w) if j == num_tiles_w - 1 else min(tile_result.shape[1] - overlap * scale, expected_w)
                valid_y_end = min(tile_result.shape[0], expected_h) if i == num_tiles_h - 1 else min(tile_result.shape[0] - overlap * scale, expected_h)
                
                # Calculate valid region in the output image
                valid_out_width = valid_x_end - valid_x_start
                valid_out_height = valid_y_end - valid_y_start
                
                # Make sure we don't go out of bounds in the output image
                if out_y_start + valid_y_start + valid_out_height <= output_h and out_x_start + valid_x_start + valid_out_width <= output_w:
                    # Place valid region in output image
                    output_image[
                        out_y_start + valid_y_start:out_y_start + valid_y_start + valid_out_height,
                        out_x_start + valid_x_start:out_x_start + valid_x_start + valid_out_width
                    ] = tile_result[valid_y_start:valid_y_start + valid_out_height, valid_x_start:valid_x_start + valid_out_width]
                else:
                    print(f"Warning: Skipping tile at ({i},{j}) due to output bounds")
                
                pbar.update(1)
    
    return output_image


def enhance_image(input_path: str,
                  output_path: str,
                  model_xml: str = "C:\\Users\\aathi\\Documents\\Project\\Image_enhancer\\pixel-perfect-iris-enhance-main\\Openvino_models\\realesrgan.xml",
                  device: str = "GPU",
                  tile_size: int = 512,
                  tile_overlap: int = 32,
                  denoise_strength: int = 0,
                  face_enhance_strength: int = 0,
                  sharpen_strength: int = 0,
                  scale_factor: int = 2) -> dict:
    """Loads image, runs tiled SR, saves output, returns stats."""
    # (1) Load & compile model
    core = Core()
    if device not in core.available_devices:
        device = "CPU"
    model = core.read_model(model=model_xml)
    compiled = core.compile_model(model=model, device_name=device)
    input_layer = compiled.input(0)
    output_layer = compiled.output(0)

    # (2) Load image
    orig = cv2.imread(input_path)
    if orig is None:
        raise RuntimeError(f"Cannot read {input_path}")
    rgb = cv2.cvtColor(orig, cv2.COLOR_BGR2RGB)    

    # (3) Enhance
    start_time = time.time()
    enhanced_image = enhance_image_tiled(
        image=rgb,
        compiled_model=compiled,
        output_layer=output_layer,
        tile_size=tile_size,
        overlap=tile_overlap,
        scale=scale_factor    )
    
    # Apply additional processing based on user settings
    if denoise_strength > 0:
        print(f"Applying denoise with strength: {denoise_strength}")
        # Apply a bilateral filter for denoising, strength controls the filter parameters
        d = 5  # diameter of each pixel neighborhood
        sigma_color = 0.1 * denoise_strength + 30  # larger values mean more colors will be mixed together
        sigma_space = 0.1 * denoise_strength + 30  # larger values mean pixels farther out will be mixed
        enhanced_image = cv2.bilateralFilter(enhanced_image, d, sigma_color, sigma_space)
    
    if face_enhance_strength > 0:
        print(f"Applying face enhancement with strength: {face_enhance_strength}")
        # More natural face enhancement with controlled parameters
        
        # Convert to LAB color space for better color handling
        lab_image = cv2.cvtColor(enhanced_image, cv2.COLOR_RGB2LAB)
        l_channel, a_channel, b_channel = cv2.split(lab_image)
        
        # Enhance the L channel (lightness) in a more controlled way
        # Use a non-linear curve to prevent over-whitening at higher values
        strength_factor = face_enhance_strength / 100.0  # normalize to 0-1
        
        # Apply a gentler enhancement curve
        clahe = cv2.createCLAHE(clipLimit=2.0 + (strength_factor * 2.0), tileGridSize=(8, 8))
        enhanced_l = clahe.apply(l_channel)
        
        # Mix with original based on strength to allow for subtle adjustments
        l_channel = cv2.addWeighted(l_channel, 1.0 - (strength_factor * 0.7), enhanced_l, strength_factor * 0.7, 0)
        
        # Reconstruct image
        enhanced_lab = cv2.merge([l_channel, a_channel, b_channel])
        enhanced_image = cv2.cvtColor(enhanced_lab, cv2.COLOR_LAB2RGB)
        
        # Add a very subtle warm tone for skin (more natural look)
        if strength_factor > 0.3:
            # Create a warm overlay
            warm_overlay = enhanced_image.copy()
            warm_overlay[:,:,0] = np.clip(warm_overlay[:,:,0] * 1.05, 0, 255)  # Slightly increase red
            warm_overlay[:,:,2] = np.clip(warm_overlay[:,:,2] * 0.98, 0, 255)  # Slightly decrease blue
            
            # Mix overlay based on strength
            blend_factor = min(0.3, (strength_factor - 0.3) * 0.5)
            enhanced_image = cv2.addWeighted(enhanced_image, 1.0 - blend_factor, warm_overlay, blend_factor, 0)
    
    if sharpen_strength > 0:
        print(f"Applying sharpening with strength: {sharpen_strength}")
        # Apply unsharp mask for sharpening
        blur = cv2.GaussianBlur(enhanced_image, (0, 0), 3)
        # Scale the sharpening effect based on strength (0-100%)
        amount = sharpen_strength / 100 * 1.5  # Convert percentage to a reasonable amount factor
        enhanced_image = cv2.addWeighted(enhanced_image, 1.0 + amount, blur, -amount, 0)
    
    inference_time = time.time() - start_time    # (4) Save result with optimized compression
    # Determine file extension and use appropriate compression
    _, file_ext = os.path.splitext(output_path)
    file_ext = file_ext.lower()
    
    # Convert back to BGR for OpenCV
    output_bgr = cv2.cvtColor(enhanced_image, cv2.COLOR_RGB2BGR)
    
    if file_ext == '.jpg' or file_ext == '.jpeg':
        # Use optimal JPEG compression (95% quality)
        compression_params = [cv2.IMWRITE_JPEG_QUALITY, 95]
        cv2.imwrite(output_path, output_bgr, compression_params)
    elif file_ext == '.png':
        # Use optimal PNG compression (9 = max compression)
        compression_params = [cv2.IMWRITE_PNG_COMPRESSION, 9]
        cv2.imwrite(output_path, output_bgr, compression_params)
    elif file_ext == '.webp':
        # Use lossless WebP compression with quality 100
        compression_params = [cv2.IMWRITE_WEBP_QUALITY, 100]
        cv2.imwrite(output_path, output_bgr, compression_params)
    else:
        # Default case for other formats
        cv2.imwrite(output_path, output_bgr)
    
    # Calculate compression ratio
    orig_size = os.path.getsize(input_path)
    output_size = os.path.getsize(output_path)
    compression_ratio = orig_size / output_size if output_size > 0 else 0

    return {
        "original_shape": orig.shape,
        "enhanced_shape": enhanced_image.shape,
        "time_sec": inference_time,
        "orig_size_kb": round(orig_size / 1024, 2),
        "output_size_kb": round(output_size / 1024, 2),
        "compression_ratio": round(compression_ratio, 2)
    }


