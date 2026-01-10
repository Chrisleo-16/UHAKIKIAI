<p align="center">
  <img src="https://tpwxyhhcyyamdumnjmjb.supabase.co/storage/v1/object/public/public-assets/uhakikiai-high-resolution-logo-transparent.svg" alt="UhakikiAI Logo" width="300">
</p>
UhakikiAI Core Engine 🛡️
The Trust Layer for African Credentials.

UhakikiAI is a high-performance, autonomous verification engine designed to validate educational and identity documents in real-time. It combines Computer Vision (OpenCV), Optical Character Recognition (Tesseract), and Generative Forensics to detect forgeries and cross-reference data with national registries.

🚀 Key Features
🔍 Intelligence Layer
Generative Forensics: Uses Error Level Analysis (ELA) and noise sigma detection to flag digitally manipulated images (deepfakes/Photoshop).

Smart OCR: Powered by pytesseract to extract Index Numbers, Names, and Grades from noisy document images.

Agentic Verification: An autonomous logic layer that weighs forensic evidence against data consistency to calculate a dynamic risk_score (0-100).

National DB Sync: Direct integration with Supabase to cross-reference extracted data against the national_records table.

🔐 Bank-Grade Security
Peppered Hashing: API keys are secured using Argon2/Bcrypt combined with a high-entropy server-side SECRET_PEPPER. Keys are never stored in plain text.

In-Memory Rate Limiter: Protects against brute-force attacks by blocking IP addresses that fail authentication >5 times in a 15-minute window.

Key Masking: The database only stores a partial prefix (uh_live_...) and the hash, ensuring zero-knowledge storage.

🛠️ Technology Stack
Core: Python 3.9+, FastAPI

Vision: OpenCV, NumPy, Pillow, Tesseract-OCR

Database: Supabase (PostgreSQL + RLS)

Security: Passlib (Bcrypt), Python Secrets

Deployment: Render / Vercel

💻 Local Development Setup
Follow these steps to run the engine locally.

Prerequisites
Python 3.9 or higher

Tesseract OCR installed on your system.

1. Clone the Repository
Bash

git clone <YOUR_GIT_URL>
cd uhakikiai-engine
2. Install Dependencies
Bash

pip install -r requirements.txt
3. Configure Environment Variables
Create a .env file in the root directory and add your credentials:

Ini, TOML

# Database Config
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_KEY="your-service-role-key"

# Security Config (CRITICAL)
# Generate a long random string for this
SECRET_PEPPER="your_super_secret_random_pepper_string_here"

# Server Config
PORT=8000
4. Run the Engine
Bash

# Start the server with hot-reloading
uvicorn main:app --reload
The API will be live at http://localhost:8000.

📚 API Documentation
Once the server is running, you can access the professional interactive documentation:

Swagger UI: http://localhost:8000/api/v1/docs - Test endpoints directly.

ReDoc: http://localhost:8000/api/v1/redoc - Read technical specs.

🔒 Security Architecture
API Key Generation
When a company is onboarded via /portal/generate_key, the system:

Generates a 32-byte high-entropy random string.

Appends the SECRET_PEPPER from environment variables.

Hashes the result using bcrypt.

Stores only the hash and a short prefix in the database.

Request Validation
Every request to /v1/ endpoints passes through the validate_api_key dependency:

IP Check: Is the client IP in the temporary blocklist?

Prefix Lookup: Finds the key metadata efficiently.

Peppered Verification: Re-combines the input key + Pepper to verify against the stored hash.

☁️ Deployment (Render)
Push your code to GitHub.

Create a new Web Service on Render.

Set the Build Command: pip install -r requirements.txt

Set the Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT

Important: Go to the "Environment" tab in Render and add your SUPABASE_URL, SUPABASE_KEY, and SECRET_PEPPER.

📄 License
This project is proprietary. Unauthorized copying or distribution of the forensic logic is strictly prohibited.
