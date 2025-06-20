

# AI Image Enhancer 🖼️✨

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)

A powerful AI-powered image enhancement tool that transforms low-quality images into crystal-clear visuals using advanced AI models.

## ✨ Project Highlights

- 🔍 **Super Resolution** - Scale images up to 4x with incredible detail preservation
- 👤 **Face Enhancement** - Intelligently enhance facial features for natural results
- 🌟 **Deblurring** - Effectively remove blur and restore image clarity
- 📐 **Advanced Sharpening** - Precise detail enhancement without introducing artifacts
- 🧠 **AI Powered** - Uses Intel OpenVINO & RealESRGAN for high-quality results
- ⚡ **Optimized Performance** - Tiled processing for memory-efficient enhancement of any image size
- 🎨 **Modern UI** - Sleek and intuitive interface built with React and Tailwind CSS

## 🛠️ Technology Stack

### Frontend
- ⚛️ **React** - UI component library
- 📝 **TypeScript** - Type safety and better developer experience
- 🎭 **Vite** - Fast, modern frontend build tool
- 🎨 **Tailwind CSS** - Utility-first CSS framework
- 🧩 **shadcn/ui** - High-quality UI components

### Backend
- 🐍 **Python** - For image processing backend
- 🚀 **FastAPI** - High-performance API framework
- 🧠 **Intel OpenVINO** - Hardware-accelerated AI processing
- 🖼️ **RealESRGAN** - Advanced image super-resolution model
- 🔄 **Tiled Processing** - Memory-efficient processing of large images

## 🚀 Getting Started

### Prerequisites

- Node.js and npm (for frontend)
- Python 3.8+ (for backend)
- Git

### Installation

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory
cd <YOUR_PROJECT_NAME>

# Step 3: Install frontend dependencies
npm i

# Step 4: Set up Python environment (in a separate terminal)
cd backend
python -m venv venv
# On Windows
venv\Scripts\activate
# On macOS/Linux
source venv/bin/activate

# Step 5: Install Python dependencies
pip install -r requirements.txt
```

## 🏃‍♂️ Running the Application

### Start the frontend

```sh
# In the project root directory
npm run dev
```

### Start the backend

```sh
# In a separate terminal, from the backend directory
# On Windows
venv\Scripts\activate
# change to backend directory
cd backend
# Start the FastAPI server
python -m uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

Visit `http://localhost:8080` in your browser to use the application.

## 📸 Features in Detail

### Image Enhancement Options

- **Super Resolution**: Upscale images up to 4x their original resolution while maintaining details
- **Face Enhancement**: Special processing to enhance facial features naturally
- **Deblurring**: Remove motion blur or out-of-focus issues
- **Sharpening**: Add precise detail enhancement without oversharpening artifacts

### Performance Optimizations

- Tiled processing allows enhancement of images of any size
- GPU acceleration for faster processing when available
- Efficient memory usage even for large images

## 👨‍💻 Created by Aathishwar

Feel free to contribute to this project by creating a pull request or opening an issue.
