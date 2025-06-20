# app.py
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import uuid, os
from realesrgan_service import enhance_image


app = FastAPI()

# Allow your dev server origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],  # or ["*"] for wide open
    allow_methods=["*"],
    allow_headers=["*"],
)

TMP = "tmp_files"
os.makedirs(TMP, exist_ok=True)

@app.post("/enhance/")
async def api_enhance(
    file: UploadFile = File(...),
    denoise: int = Form(0),
    face_enhance: int = Form(0),
    scale: int = Form(2),
    sharpen: int = Form(0),
    tile_size: int = Form(512),
    overlap: int = Form(32),
    device: str = Form("GPU")
):
    ext = os.path.splitext(file.filename)[1]
    in_path = os.path.join(TMP, f"{uuid.uuid4()}{ext}")
    out_path = os.path.join(TMP, f"enh_{uuid.uuid4()}{ext}")
    
    with open(in_path, "wb") as f:
        f.write(await file.read())
        
    stats = enhance_image(
        input_path=in_path,
        output_path=out_path,
        model_xml=os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "Openvino_models", "realesrgan.xml")),
        device=device,
        tile_size=tile_size,
        tile_overlap=overlap,
        denoise_strength=denoise,
        face_enhance_strength=face_enhance,
        sharpen_strength=sharpen,
        scale_factor=scale
    )

    # Determine the correct media type based on file extension
    ext_lower = ext.lower()
    if ext_lower == ".jpg" or ext_lower == ".jpeg":
        media_type = "image/jpeg"
    elif ext_lower == ".png":
        media_type = "image/png"
    elif ext_lower == ".webp":
        media_type = "image/webp"
    else:
        # Default fallback
        media_type = "image/jpeg"

    response = FileResponse(
        out_path, 
        media_type=media_type, 
        filename=f"enhanced_{os.path.basename(file.filename)}"
    )
    
    # Add enhancement stats as headers for frontend use
    response.headers["X-Enhancement-Time"] = str(stats["time_sec"])
    response.headers["X-Original-Size"] = str(stats["orig_size_kb"])
    response.headers["X-Enhanced-Size"] = str(stats["output_size_kb"])
    
    return response
