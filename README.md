# AI Image Enhancer 🖼️✨

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)

A powerful AI-driven image enhancement tool that transforms low-quality images into crystal-clear visuals using cutting-edge models and GPU-accelerated performance.

---

## ✨ Highlights

* 🔍 **Super Resolution** – Upscale images up to 4× while preserving fine details
* 👤 **Face Enhancement** – Enhance facial features with natural, intelligent correction
* 🌫️ **Deblurring** – Remove motion blur and restore clarity
* 🧼 **Sharpening** – Add detail without introducing artifacts
* 🧠 **AI-Powered** – Leverages **Intel OpenVINO** & **RealESRGAN**
* ⚡ **Optimized** – Tiled processing enables memory-efficient enhancement for large images
* 🖥️ **Modern UI** – Sleek and intuitive frontend built with React + Tailwind CSS

---

## 🛠 Tech Stack

### Frontend

* ⚛️ **React** – Component-based UI
* 📝 **TypeScript** – Safer, smarter development
* ⚡ **Vite** – Lightning-fast build tool
* 🎨 **Tailwind CSS** – Utility-first styling
* 🧩 **shadcn/ui** – Elegant UI components

### Backend

* 🐍 **Python** – Image processing logic
* 🚀 **FastAPI** – Fast, async-friendly REST API
* 🧠 **OpenVINO** – Hardware-accelerated inference
* 🖼 **RealESRGAN** – AI model for super-resolution
* 🧩 **Tiled Processing** – Efficient handling of large images

---

## 🚀 Getting Started

### Prerequisites

* Node.js & npm
* Python 3.8+
* Git

---

### 🔧 Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
```

#### Frontend Setup

```bash
# Install frontend dependencies
npm install
```

#### Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt
```

---

## 🏃 Running the Application

### Start Frontend

```bash
npm run dev
```

### Start Backend

```bash
# Activate backend virtual environment and run FastAPI
cd backend

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

# Start server
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

Now visit **[http://localhost:8080](http://localhost:8080)** to access the app.

---

## 📸 Screenshots

![image](https://github.com/user-attachments/assets/b04816ff-030f-417c-807b-383fab06a8eb)

---

## 📋 Features in Detail

### Enhancement Options

* **Super Resolution** – Upscales images up to 4×
* **Face Enhancement** – Enhances faces using AI for natural output
* **Deblurring** – Removes motion and lens blur
* **Sharpening** – Restores and enhances edge clarity

### Performance Boosts

* **Tiled Processing** – Handles any image size with minimal memory usage
* **GPU Acceleration** – Uses OpenVINO for fast inference
* **Optimized RAM Usage** – Efficient model loading and image tiling

---

## 👨‍💻 Author

Created with ❤️ by [Aathishwar](https://github.com/Aathishwar)

Feel free to contribute via pull requests or open issues!

---


