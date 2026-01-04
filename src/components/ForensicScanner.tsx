import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Camera, Scan, FileCheck, AlertTriangle, Eye, Flame, Zap, FileSearch, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useOCR } from '@/hooks/useOCR';
import { useBiometricVerification } from '@/hooks/useBiometricVerification';
import { OCRResultsDisplay } from './OCRResultsDisplay';
import { WebcamCapture, BiometricResult } from './WebcamCapture';
import { BiometricResultsDisplay } from './BiometricResultsDisplay';
import { OCRResult } from '@/types/ocr';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ForensicScannerProps {
  onScanComplete: (ocrResult: OCRResult | null, biometricMatch?: number) => void;
  onReset: () => void;
}

const getTerminalLogs = (ocrResult: OCRResult | null, biometricResult?: BiometricResult | null) => {
  if (!ocrResult) {
    return [
      { type: 'system', text: '[SYSTEM] Initializing Agentic Core...' },
      { type: 'info', text: '[OCR] Extracting text...' },
      { type: 'warning', text: '[SYSTEM] No data extracted.' },
    ];
  }

  const logs = [
    { type: 'system', text: '[SYSTEM] Initializing Agentic Core...' },
    { type: 'info', text: '[OCR] Extracting text from document...' },
  ];

  if (ocrResult.structured?.studentName) {
    logs.push({ type: 'success', text: `[OCR] Student: "${ocrResult.structured.studentName}"` });
  }
  if (ocrResult.structured?.indexNumber) {
    logs.push({ type: 'info', text: `[OCR] Index: ${ocrResult.structured.indexNumber}` });
  }
  if (ocrResult.structured?.schoolName) {
    logs.push({ type: 'info', text: `[OCR] School: "${ocrResult.structured.schoolName}"` });
  }
  if (ocrResult.structured?.meanGrade) {
    logs.push({ type: 'success', text: `[OCR] Mean Grade: ${ocrResult.structured.meanGrade} (${ocrResult.structured.meanPoints || 'N/A'} pts)` });
  }

  logs.push({ type: 'info', text: `[AI] OCR Confidence: ${(ocrResult.confidence * 100).toFixed(0)}%` });

  if (ocrResult.verificationElements?.hasWatermark) {
    logs.push({ type: 'success', text: '[VERIFY] Official watermark detected.' });
  }
  if (ocrResult.verificationElements?.hasQRCode) {
    logs.push({ type: 'success', text: '[VERIFY] QR code found.' });
  }
  if (ocrResult.verificationElements?.hasOfficialStamp) {
    logs.push({ type: 'success', text: '[VERIFY] Official stamp detected.' });
  }

  // Add biometric logs
  if (biometricResult) {
    logs.push({ type: 'info', text: '[BIO] Biometric capture acquired.' });
    logs.push({ type: 'success', text: `[BIO] Liveness Score: ${(biometricResult.livenessScore * 100).toFixed(0)}%` });
    if (biometricResult.passed) {
      logs.push({ type: 'success', text: '[BIO] Liveness verification PASSED.' });
    } else {
      logs.push({ type: 'warning', text: '[BIO] Liveness verification needs review.' });
    }
  }

  if (ocrResult.confidence < 0.7) {
    logs.push({ type: 'warning', text: '[DEEP-SCAN] Low confidence - manual review recommended.' });
  }
  if (!ocrResult.verificationElements?.hasWatermark && !ocrResult.verificationElements?.hasOfficialStamp) {
    logs.push({ type: 'alert', text: '[ALERT] Missing official verification elements!' });
  }

  logs.push({ type: 'system', text: '[SYSTEM] Scan complete. Awaiting officer decision.' });

  return logs;
};

export function ForensicScanner({ onScanComplete, onReset }: ForensicScannerProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [logs, setLogs] = useState<{ type: string; text: string }[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showOCRResults, setShowOCRResults] = useState(false);
  const [biometricCapture, setBiometricCapture] = useState<BiometricResult | null>(null);

  const { user } = useAuth();
  const { extractText, isExtracting, ocrResult, error: ocrError, reset: resetOCR } = useOCR();
  const { verifyBiometrics, isVerifying: isBiometricVerifying, result: biometricVerifyResult, reset: resetBiometric } = useBiometricVerification();

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setUploadedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setShowResults(false);
      setShowOCRResults(false);
      setBiometricCapture(null);
      resetOCR();
      resetBiometric();
      onReset();
      toast.success('Document uploaded successfully');
    }
  }, [onReset, resetOCR, resetBiometric]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setShowResults(false);
      setShowOCRResults(false);
      setBiometricCapture(null);
      resetOCR();
      resetBiometric();
      onReset();
      toast.success('Document uploaded successfully');
    }
  };

  const handleBiometricCapture = useCallback((result: BiometricResult) => {
    setBiometricCapture(result);
    toast.success('Biometric captured - Ready for scan');
  }, []);

  const handleBiometricReset = useCallback(() => {
    setBiometricCapture(null);
    resetBiometric();
  }, [resetBiometric]);

  const handleScan = async () => {
    if (!uploadedFile) {
      toast.error('Please upload a document first');
      return;
    }

    setIsScanning(true);
    setLogs([]);
    setShowResults(false);
    setShowOCRResults(false);

    setLogs([{ type: 'system', text: '[SYSTEM] Initializing Agentic Core...' }]);
    await new Promise((resolve) => setTimeout(resolve, 300));
    setLogs((prev) => [...prev, { type: 'info', text: '[OCR] Sending document to AI vision model...' }]);

    // Call OCR
    const result = await extractText(uploadedFile);

    // If biometric capture exists, run facial comparison
    if (biometricCapture && previewUrl) {
      setLogs((prev) => [...prev, { type: 'info', text: '[BIO] Initiating facial comparison...' }]);
      await verifyBiometrics(previewUrl, biometricCapture.capturedImage, result);
      setLogs((prev) => [...prev, { type: 'success', text: '[BIO] Facial comparison complete.' }]);
    }

    // Generate logs
    const terminalLogs = getTerminalLogs(result, biometricCapture);
    
    for (let i = 2; i < terminalLogs.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 250));
      setLogs((prev) => [...prev, terminalLogs[i]]);
    }

    await new Promise((resolve) => setTimeout(resolve, 300));
    setIsScanning(false);
    setShowResults(true);
    setShowOCRResults(true);
    
    const biometricScore = biometricVerifyResult?.matchScore || (biometricCapture ? biometricCapture.livenessScore * 100 : undefined);
    onScanComplete(result, biometricScore);

    // Save verification to database
    const riskScore = result ? Math.round((1 - result.confidence) * 100) : 50;
    const verdict = result && result.confidence >= 0.7 ? 'verified' : result ? 'flagged' : 'rejected';
    let fraudType = null;
    if (!result?.verificationElements?.hasWatermark && !result?.verificationElements?.hasOfficialStamp) {
      fraudType = 'Missing Security';
    } else if (result && result.confidence < 0.5) {
      fraudType = 'Low Confidence';
    }

    try {
      await supabase.from('verifications').insert({
        document_name: uploadedFile.name,
        document_type: 'certificate',
        student_name: result?.structured?.studentName || null,
        index_number: result?.structured?.indexNumber || null,
        institution: result?.structured?.schoolName || null,
        verdict,
        risk_score: riskScore,
        fraud_type: fraudType,
        biometric_score: biometricScore ? Math.round(biometricScore) : null,
        ocr_confidence: result ? Number((result.confidence * 100).toFixed(2)) : null,
        validation_passed: result ? result.confidence >= 0.7 : false,
        user_id: user?.id,
      });
    } catch (err) {
      console.error('Failed to save verification:', err);
    }

    if (result && result.confidence >= 0.7) {
      toast.success('Scan Complete: Document processed successfully', {
        icon: <FileCheck className="w-5 h-5 text-success" />,
      });
    } else if (result) {
      toast.warning('Scan Complete: Low confidence - review recommended', {
        icon: <AlertTriangle className="w-5 h-5 text-warning" />,
      });
    } else {
      toast.error('Scan Failed: Could not extract data', {
        icon: <AlertTriangle className="w-5 h-5 text-danger" />,
      });
    }
  };

  const handleRemove = () => {
    setUploadedFile(null);
    setPreviewUrl(null);
    setShowResults(false);
    setShowOCRResults(false);
    setLogs([]);
    setShowHeatmap(false);
    setBiometricCapture(null);
    resetOCR();
    resetBiometric();
    onReset();
  };

  useEffect(() => {
    toast.info('System Connected to National Registry', {
      icon: <Zap className="w-5 h-5 text-primary" />,
      duration: 4000,
    });
  }, []);

  const isProcessing = isScanning || isExtracting || isBiometricVerifying;

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 min-h-full">
        {/* Left Panel - Input Zone */}
        <div className="space-y-6">
          {/* Document Upload */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-primary" />
              Document Input
            </h3>

            <div
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              className={`dropzone p-8 text-center transition-all ${isDragOver ? 'active' : ''}`}
            >
              {previewUrl ? (
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Uploaded document"
                    className="max-h-48 mx-auto rounded-lg border border-border"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={handleRemove}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <>
                  <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-2">
                    Drag & Drop your <span className="text-primary font-medium">KCSE Certificate / ID</span>
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">PNG, JPG up to 10MB</p>
                  <label className="cursor-pointer">
                    <span className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors">
                      Browse Files
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                  </label>
                </>
              )}
            </div>
          </motion.div>

          {/* Webcam / Biometric Capture */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6"
          >
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Camera className="w-5 h-5 text-primary" />
              Biometric Liveness Check
              {biometricCapture && (
                <span className="ml-auto text-xs bg-success/20 text-success px-2 py-1 rounded-full flex items-center gap-1">
                  <UserCheck className="w-3 h-3" /> Captured
                </span>
              )}
            </h3>
            <WebcamCapture 
              onCapture={handleBiometricCapture}
              onReset={handleBiometricReset}
              isVerifying={isProcessing}
            />
          </motion.div>

          {/* Scan Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Button
              onClick={handleScan}
              disabled={isProcessing || !uploadedFile}
              className="w-full h-16 text-lg font-bold bg-gradient-to-r from-primary to-primary/80 text-primary-foreground pulse-glow disabled:opacity-50 disabled:cursor-not-allowed disabled:animate-none"
            >
              {isProcessing ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="flex items-center gap-3"
                >
                  <Scan className="w-6 h-6" />
                  {isBiometricVerifying ? 'COMPARING FACES...' : isExtracting ? 'EXTRACTING TEXT...' : 'SCANNING...'}
                </motion.div>
              ) : (
                <span className="flex items-center gap-3">
                  <Scan className="w-6 h-6" />
                  INITIATE FORENSIC SCAN
                  {biometricCapture && <span className="text-sm opacity-80">(+ Biometric)</span>}
                </span>
              )}
            </Button>
          </motion.div>
        </div>

        {/* Right Panel - Analysis */}
        <div className="space-y-6">
          {/* Document Viewer with Heatmap */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary" />
                Document Analysis
              </h3>
              {showResults && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">Original</span>
                  <Switch
                    checked={showHeatmap}
                    onCheckedChange={setShowHeatmap}
                  />
                  <span className={`text-sm ${showHeatmap ? 'text-danger' : 'text-muted-foreground'}`}>
                    Heatmap
                  </span>
                </div>
              )}
            </div>

            <div className="relative aspect-[4/3] bg-muted/50 rounded-lg overflow-hidden border border-border">
              {previewUrl ? (
                <>
                  <img
                    src={previewUrl}
                    alt="Document for analysis"
                    className="w-full h-full object-contain"
                  />
                  
                  {isProcessing && <div className="scan-line" />}

                  <AnimatePresence>
                    {showHeatmap && showResults && (
                      <>
                        <motion.div
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                          className="heatmap-blob"
                          style={{ top: '35%', left: '50%', width: '120px', height: '60px' }}
                        />
                        <motion.div
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                          transition={{ delay: 0.1 }}
                          className="heatmap-blob"
                          style={{ bottom: '20%', right: '25%', width: '80px', height: '40px' }}
                        />
                      </>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">Upload a document to begin analysis</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Forensic Terminal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glass-card p-4"
          >
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <Flame className="w-4 h-4 text-primary" />
              FORENSIC TERMINAL
            </h3>
            <div className="bg-[hsl(220,25%,5%)] rounded-lg p-4 h-48 overflow-auto font-mono text-sm">
              {logs.length === 0 ? (
                <p className="text-muted-foreground animate-pulse">Awaiting scan initiation...</p>
              ) : (
                logs.map((log, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`mb-1 ${
                      log.type === 'alert'
                        ? 'text-danger'
                        : log.type === 'success'
                        ? 'text-success'
                        : log.type === 'warning'
                        ? 'text-warning'
                        : log.type === 'system'
                        ? 'text-primary'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {log.text}
                  </motion.div>
                ))
              )}
              {isProcessing && (
                <span className="inline-block w-2 h-4 bg-primary animate-pulse" />
              )}
            </div>
          </motion.div>

          {/* OCR Results Panel */}
          {showOCRResults && ocrResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-4"
            >
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <FileSearch className="w-4 h-4 text-primary" />
                EXTRACTED DATA
              </h3>
              <OCRResultsDisplay result={ocrResult} />
            </motion.div>
          )}

          {/* Biometric Results */}
          {showResults && biometricVerifyResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-4"
            >
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-primary" />
                BIOMETRIC ANALYSIS
              </h3>
              <BiometricResultsDisplay result={biometricVerifyResult} />
            </motion.div>
          )}

          {/* Error Displays */}
          {ocrError && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-danger/10 border border-danger/30 rounded-lg"
            >
              <p className="text-danger text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                {ocrError}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
