// UhakikiAI Python Backend API Configuration
// Production URL for the FastAPI backend on Render

export const API_BASE_URL = 'https://uhakikiai.onrender.com';

// Type definitions for API responses
interface RegisterCompanyResponse {
  id: string;
  company_name: string;
  email: string;
  created_at: string;
}

interface GenerateKeyResponse {
  api_key: string;
  message: string;
  company_id?: string;
}

interface VerifyDocumentResponse {
  status: 'VERIFIED' | 'FLAGGED' | 'ERROR';
  flags: string[];
  score: number;
  data?: {
    name: string;
    institution: string;
  };
  message?: string;
}

interface BiometricVerifyResponse {
  match: boolean;
  confidence: number;
  message?: string;
}

interface HealthCheckResponse {
  status: string;
  version: string;
  timestamp?: string;
}

// ==========================================
// Health Check - Check if backend is online
// ==========================================
export async function checkBackendHealth(): Promise<HealthCheckResponse> {
  const response = await fetch(`${API_BASE_URL}/`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Backend unavailable');
  }

  return response.json();
}

// ==========================================
// Portal Routes - Company/User Management
// ==========================================

/**
 * Register a new company/institution on the platform
 * POST /portal/register_company
 */
export async function registerCompany(
  name: string,
  email: string
): Promise<RegisterCompanyResponse> {
  const formData = new FormData();
  formData.append('name', name);
  formData.append('email', email);

  const response = await fetch(`${API_BASE_URL}/portal/register_company`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Registration failed' }));
    throw new Error(error.detail || 'Failed to register company');
  }

  return response.json();
}

/**
 * Generate an API key for a registered company
 * POST /portal/generate_key
 */
export async function generateAPIKey(email: string): Promise<GenerateKeyResponse> {
  const formData = new FormData();
  formData.append('email', email);

  const response = await fetch(`${API_BASE_URL}/portal/generate_key`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Key generation failed' }));
    throw new Error(error.detail || 'Failed to generate API key');
  }

  return response.json();
}

// ==========================================
// Public API Routes - Document Verification
// ==========================================

/**
 * Verify a document using the AI-powered analysis
 * POST /v1/verify_document
 */
export async function verifyDocument(
  file: File,
  apiKey: string
): Promise<VerifyDocumentResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/v1/verify_document`, {
    method: 'POST',
    headers: {
      'X-API-Key': apiKey,
    },
    body: formData,
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Invalid API Key');
    }
    if (response.status === 403) {
      throw new Error('API Key revoked or expired');
    }
    const error = await response.json().catch(() => ({ detail: 'Verification failed' }));
    throw new Error(error.detail || 'Document verification failed');
  }

  return response.json();
}

/**
 * Verify biometric data (face matching)
 * POST /v1/biometric_verify
 */
export async function verifyBiometric(
  documentImage: File,
  selfieImage: File,
  apiKey: string
): Promise<BiometricVerifyResponse> {
  const formData = new FormData();
  formData.append('document', documentImage);
  formData.append('selfie', selfieImage);

  const response = await fetch(`${API_BASE_URL}/v1/biometric_verify`, {
    method: 'POST',
    headers: {
      'X-API-Key': apiKey,
    },
    body: formData,
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Invalid API Key');
    }
    const error = await response.json().catch(() => ({ detail: 'Biometric verification failed' }));
    throw new Error(error.detail || 'Biometric verification failed');
  }

  return response.json();
}

// ==========================================
// Utility Functions
// ==========================================

/**
 * Get the API documentation URL
 */
export function getDocsUrl(): string {
  return `${API_BASE_URL}/api/v1/docs`;
}

/**
 * Get the ReDoc documentation URL
 */
export function getRedocUrl(): string {
  return `${API_BASE_URL}/api/v1/redoc`;
}
