// Python Backend API Configuration
// Update this URL to point to your deployed FastAPI backend

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

interface RegisterCompanyResponse {
  id: string;
  company_name: string;
  email: string;
  created_at: string;
}

interface GenerateKeyResponse {
  api_key: string;
  message: string;
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

// Portal Routes - For company/user management
export async function registerCompany(name: string, email: string): Promise<RegisterCompanyResponse> {
  const formData = new FormData();
  formData.append('name', name);
  formData.append('email', email);

  const response = await fetch(`${API_BASE_URL}/portal/register_company`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to register company');
  }

  return response.json();
}

export async function generateAPIKey(email: string): Promise<GenerateKeyResponse> {
  const formData = new FormData();
  formData.append('email', email);

  const response = await fetch(`${API_BASE_URL}/portal/generate_key`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to generate API key');
  }

  return response.json();
}

// Public API Routes - For document verification
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
    const error = await response.json();
    throw new Error(error.detail || 'Verification failed');
  }

  return response.json();
}
