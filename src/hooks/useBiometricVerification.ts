import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { OCRResult } from '@/types/ocr';

export interface BiometricVerificationResult {
  matchScore: number;
  matchVerdict: 'MATCH' | 'PARTIAL_MATCH' | 'NO_MATCH' | 'INCONCLUSIVE';
  matchingFeatures: string[];
  differingFeatures: string[];
  documentName?: string;
  livenessConfidence: number;
  livenessIndicators: {
    naturalLighting: boolean;
    depthCues: boolean;
    skinTexture: boolean;
    eyeReflection: boolean;
  };
  concerns: string[];
  recommendation: 'APPROVE' | 'MANUAL_REVIEW' | 'REJECT';
  notes?: string;
}

interface BiometricResponse {
  success: boolean;
  data?: BiometricVerificationResult;
  error?: string;
}

export function useBiometricVerification() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<BiometricVerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const verifyBiometrics = useCallback(async (
    documentImage: string,
    selfieImage: string,
    documentData?: OCRResult | null
  ): Promise<BiometricVerificationResult | null> => {
    setIsVerifying(true);
    setError(null);
    setResult(null);

    try {
      const { data, error: funcError } = await supabase.functions.invoke<BiometricResponse>('biometric-verify', {
        body: { 
          documentImage, 
          selfieImage,
          documentData: documentData?.structured
        }
      });

      if (funcError) {
        throw new Error(funcError.message || 'Biometric verification failed');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Verification failed');
      }

      const verificationResult = data.data!;
      setResult(verificationResult);
      return verificationResult;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown verification error';
      setError(errorMessage);
      console.error('[Biometric] Error:', errorMessage);
      return null;
    } finally {
      setIsVerifying(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    verifyBiometrics,
    isVerifying,
    result,
    error,
    reset
  };
}
