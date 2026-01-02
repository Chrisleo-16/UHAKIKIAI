import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { OCRResult, OCRResponse } from '@/types/ocr';

export function useOCR() {
  const [isExtracting, setIsExtracting] = useState(false);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const extractText = useCallback(async (file: File): Promise<OCRResult | null> => {
    setIsExtracting(true);
    setError(null);
    setOcrResult(null);

    try {
      const imageBase64 = await fileToBase64(file);
      const mimeType = file.type || 'image/jpeg';

      const { data, error: funcError } = await supabase.functions.invoke<OCRResponse>('ocr-extract', {
        body: { imageBase64, mimeType }
      });

      if (funcError) {
        throw new Error(funcError.message || 'Failed to extract text');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'OCR extraction failed');
      }

      const result = data.data!;
      setOcrResult(result);
      return result;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error during OCR';
      setError(errorMessage);
      console.error('[OCR Hook] Error:', errorMessage);
      return null;
    } finally {
      setIsExtracting(false);
    }
  }, []);

  const reset = useCallback(() => {
    setOcrResult(null);
    setError(null);
  }, []);

  return {
    extractText,
    isExtracting,
    ocrResult,
    error,
    reset
  };
}
