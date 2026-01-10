# Use a more stable and modern base image (Bullseye is standard for Render)
FROM python:3.9-slim-bullseye

# 1. Prevent apt from asking for user input during installation
ENV DEBIAN_FRONTEND=noninteractive

# 2. Set the working directory
WORKDIR /app

# 3. Consolidate all system dependencies into one layer
# This reduces image size and prevents the "code 100" error
USER root
FROM python:3.9-slim-bullseye

# Install Tesseract and OpenCV system libraries
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .

CMD ["sh", "-c", "uvicorn uhakikiai_full:app --host 0.0.0.0 --port ${PORT:-10000}"]
