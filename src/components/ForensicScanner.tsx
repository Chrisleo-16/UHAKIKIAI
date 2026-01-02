import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Camera, Scan, FileCheck, AlertTriangle, Eye, Flame, Zap, FileSearch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useOCR } from '@/hooks/useOCR';
import { OCRResultsDisplay } from './OCRResultsDisplay';
import { OCRResult } from '@/types/ocr';

interface ForensicScannerProps {
  onScanComplete: (ocrResult: OCRResult | null) => void;
  onReset: () => void;
}

const getTerminalLogs = (ocrResult: OCRResult | null) => {
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

  logs.push({ type: 'info', text: `[AI] Confidence Level: ${(ocrResult.confidence * 100).toFixed(0)}%` });

  if (ocrResult.verificationElements?.hasWatermark) {
    logs.push({ type: 'success', text: '[VERIFY] Official watermark detected.' });
  }
  if (ocrResult.verificationElements?.hasQRCode) {
    logs.push({ type: 'success', text: '[VERIFY] QR code found.' });
  }
  if (ocrResult.verificationElements?.hasOfficialStamp) {
    logs.push({ type: 'success', text: '[VERIFY] Official stamp detected.' });
  }

  // Simulate anomaly detection based on confidence
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

  const { extractText, isExtracting, ocrResult, error: ocrError, reset: resetOCR } = useOCR();

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setUploadedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setShowResults(false);
      setShowOCRResults(false);
      resetOCR();
      onReset();
      toast.success('Document uploaded successfully');
    }
  }, [onReset, resetOCR]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setShowResults(false);
      setShowOCRResults(false);
      resetOCR();
      onReset();
      toast.success('Document uploaded successfully');
    }
  };

  const handleScan = async () => {
    if (!uploadedFile) {
      toast.error('Please upload a document first');
      return;
    }

    setIsScanning(true);
    setLogs([]);
    setShowResults(false);
    setShowOCRResults(false);

    // Add initial logs
    setLogs([{ type: 'system', text: '[SYSTEM] Initializing Agentic Core...' }]);
    await new Promise((resolve) => setTimeout(resolve, 300));
    setLogs((prev) => [...prev, { type: 'info', text: '[OCR] Sending document to AI vision model...' }]);

    // Call the actual OCR
    const result = await extractText(uploadedFile);

    // Generate logs based on OCR result
    const terminalLogs = getTerminalLogs(result);
    
    // Animate logs progressively
    for (let i = 2; i < terminalLogs.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 250));
      setLogs((prev) => [...prev, terminalLogs[i]]);
    }

    await new Promise((resolve) => setTimeout(resolve, 300));
    setIsScanning(false);
    setShowResults(true);
    setShowOCRResults(true);
    onScanComplete(result);

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
    resetOCR();
    onReset();
  };

  useEffect(() => {
    toast.info('System Connected to National Registry', {
      icon: <Zap className="w-5 h-5 text-primary" />,
      duration: 4000,
    });
  }, []);

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

          {/* Webcam Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6"
          >
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Camera className="w-5 h-5 text-primary" />
              Biometric Liveness Check
            </h3>
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center border border-border">
              <div className="text-center">
                <Camera className="w-16 h-16 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">Camera Feed Placeholder</p>
                <p className="text-xs text-muted-foreground">Awaiting activation...</p>
              </div>
            </div>
          </motion.div>

          {/* Scan Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Button
              onClick={handleScan}
              disabled={isScanning || isExtracting || !uploadedFile}
              className="w-full h-16 text-lg font-bold bg-gradient-to-r from-primary to-primary/80 text-primary-foreground pulse-glow disabled:opacity-50 disabled:cursor-not-allowed disabled:animate-none"
            >
              {isScanning || isExtracting ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="flex items-center gap-3"
                >
                  <Scan className="w-6 h-6" />
                  {isExtracting ? 'EXTRACTING TEXT...' : 'SCANNING...'}
                </motion.div>
              ) : (
                <span className="flex items-center gap-3">
                  <Scan className="w-6 h-6" />
                  INITIATE FORENSIC SCAN
                </span>
              )}
            </Button>
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

          {/* OCR Error Display */}
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
                  
                  {/* Scanning Animation */}
                  {(isScanning || isExtracting) && <div className="scan-line" />}

                  {/* Heatmap Overlays */}
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
              {(isScanning || isExtracting) && (
                <span className="inline-block w-2 h-4 bg-primary animate-pulse" />
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
