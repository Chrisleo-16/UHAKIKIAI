-- Create verifications table to store all verification records
CREATE TABLE public.verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_name TEXT NOT NULL,
  document_type TEXT DEFAULT 'certificate',
  student_name TEXT,
  index_number TEXT,
  institution TEXT,
  verdict TEXT NOT NULL CHECK (verdict IN ('verified', 'rejected', 'pending', 'flagged')),
  risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
  fraud_type TEXT,
  biometric_score INTEGER CHECK (biometric_score >= 0 AND biometric_score <= 100),
  ocr_confidence DECIMAL(5,2),
  validation_passed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (public read for analytics, can be restricted later)
ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;

-- Allow public read access for analytics dashboard
CREATE POLICY "Allow public read access for verifications"
ON public.verifications
FOR SELECT
USING (true);

-- Allow public insert for demo purposes (can be restricted with auth later)
CREATE POLICY "Allow public insert for verifications"
ON public.verifications
FOR INSERT
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_verifications_created_at ON public.verifications(created_at DESC);
CREATE INDEX idx_verifications_verdict ON public.verifications(verdict);
CREATE INDEX idx_verifications_fraud_type ON public.verifications(fraud_type);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_verification_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_verifications_updated_at
BEFORE UPDATE ON public.verifications
FOR EACH ROW
EXECUTE FUNCTION public.update_verification_timestamp();

-- Enable realtime for verifications table
ALTER PUBLICATION supabase_realtime ADD TABLE public.verifications;