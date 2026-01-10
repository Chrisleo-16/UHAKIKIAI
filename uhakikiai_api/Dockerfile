# Use a more stable and modern base image (Bullseye is standard for Render)
FROM python:3.9-slim-bullseye

# 1. Prevent apt from asking for user input during installation
ENV DEBIAN_FRONTEND=noninteractive

# 2. Set the working directory
WORKDIR /app

# 3. Consolidate all system dependencies into one layer
# This reduces image size and prevents the "code 100" error
USER root
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    build-essential \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# 4. Copy requirements first to leverage Docker caching
# This makes subsequent builds much faster
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copy the rest of your application code
COPY . .

# 6. Use the Render-assigned port and the proper 'exec' form for CMD
# Replace the old line with this one
CMD ["sh", "-c", "uvicorn uhakikiai_full:app --host 0.0.0.0 --port ${PORT:-10000}"]
