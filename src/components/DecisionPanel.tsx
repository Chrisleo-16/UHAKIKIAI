import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ShieldX, AlertTriangle, CheckCircle2, XCircle, UserCheck, FileWarning, TrendingUp, School, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { OCRResult } from '@/types/ocr';
import { ExportReports } from './ExportReports';
import { ValidationDisplay } from './ValidationDisplay';

interface DecisionPanelProps {
  showResults: boolean;
  ocrResult?: OCRResult | null;
  biometricScore?: number;
}

export function DecisionPanel({ showResults, ocrResult, biometricScore }: DecisionPanelProps) {
  // Derive data from OCR result or use defaults
  const candidateName = ocrResult?.structured?.studentName || 'Unknown Candidate';
  const institution = ocrResult?.structured?.schoolName || 'Unknown Institution';
  const documentType = 'KCSE Certificate';
  const meanGrade = ocrResult?.structured?.meanGrade || 'N/A';
  
  // Calculate risk score based on OCR confidence and verification elements
  const calculateRiskScore = () => {
    if (!ocrResult) return 50;
    
    let risk = 100 - (ocrResult.confidence * 100);
    
    // Lower risk if verification elements are present
    if (ocrResult.verificationElements?.hasWatermark) risk -= 10;
    if (ocrResult.verificationElements?.hasOfficialStamp) risk -= 10;
    if (ocrResult.verificationElements?.hasQRCode) risk -= 5;
    if (ocrResult.verificationElements?.hasSignature) risk -= 5;
    
    // Higher risk if missing key data
    if (!ocrResult.structured?.studentName) risk += 15;
    if (!ocrResult.structured?.indexNumber) risk += 10;
    if (!ocrResult.structured?.meanGrade) risk += 10;
    
    return Math.max(0, Math.min(100, Math.round(risk)));
  };

  const riskScore = calculateRiskScore();
  
  // Determine verdict based on risk score
  const getVerdict = () => {
    if (riskScore <= 30) return 'verified';
    if (riskScore <= 60) return 'flagged';
    return 'rejected';
  };
  
  const verdict = getVerdict();

  // Generate anomalies based on OCR analysis
  const getAnomalies = () => {
    const anomalies: string[] = [];
    
    if (!ocrResult) return ['No data extracted from document'];
    
    if (ocrResult.confidence < 0.7) {
      anomalies.push('Low OCR confidence - document may be unclear or altered');
    }
    if (!ocrResult.verificationElements?.hasWatermark) {
      anomalies.push('Official watermark not detected');
    }
    if (!ocrResult.verificationElements?.hasOfficialStamp) {
      anomalies.push('Official stamp not detected');
    }
    if (!ocrResult.structured?.indexNumber) {
      anomalies.push('Student index number not found');
    }
    if (ocrResult.notes) {
      anomalies.push(ocrResult.notes);
    }
    
    return anomalies;
  };

  const anomalies = getAnomalies();

  const handleApprove = () => {
    toast.success('Enrollment Approved', {
      description: `${candidateName} has been cleared for enrollment.`,
      icon: <CheckCircle2 className="w-5 h-5 text-success" />,
    });
  };

  const handleReject = () => {
    toast.error('Application Rejected & Reported', {
      description: 'Case file has been forwarded to fraud investigation unit.',
      icon: <XCircle className="w-5 h-5 text-danger" />,
    });
  };

  const riskAngle = (riskScore / 100) * 180;

  return (
    <motion.aside
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="w-72 xl:w-80 shrink-0 bg-card/50 backdrop-blur-xl border-l border-border p-4 xl:p-6 space-y-4 xl:space-y-6 overflow-y-auto"
    >
      {/* Risk Score Gauge */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold text-muted-foreground mb-4 text-center">RISK ASSESSMENT</h3>
        
        <div className="relative w-40 h-20 mx-auto mb-4">
          {/* Gauge Background */}
          <div className="absolute inset-0 risk-gauge rounded-t-full" style={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 0, 0 0)' }} />
          
          {/* Gauge Cover (makes it semi-circle) */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-28 h-14 bg-card rounded-t-full" />
          
          {/* Needle */}
          <AnimatePresence>
            {showResults && (
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: riskAngle - 90 }}
                transition={{ duration: 1, delay: 0.5, type: 'spring', damping: 15 }}
                className="absolute bottom-0 left-1/2 origin-bottom w-1 h-16 bg-foreground rounded-full"
                style={{ marginLeft: '-2px' }}
              />
            )}
          </AnimatePresence>
          
          {/* Center Point */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-foreground rounded-full" />
        </div>
        
        <div className="text-center">
          <AnimatePresence>
            {showResults && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1 }}
              >
                <span className={`text-4xl font-bold ${riskScore > 60 ? 'text-danger' : riskScore > 30 ? 'text-warning' : 'text-success'}`}>
                  {riskScore}%
                </span>
                <p className="text-sm text-muted-foreground mt-1">Risk Level</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Verdict Banner */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ delay: 1.2 }}
            className={`p-6 rounded-xl text-center border-2 ${
              verdict === 'verified'
                ? 'bg-success/10 border-success text-success'
                : verdict === 'flagged'
                ? 'bg-warning/10 border-warning text-warning'
                : 'bg-danger/10 border-danger text-danger'
            }`}
          >
            {verdict === 'verified' ? (
              <ShieldCheck className="w-12 h-12 mx-auto mb-2" />
            ) : verdict === 'flagged' ? (
              <AlertTriangle className="w-12 h-12 mx-auto mb-2" />
            ) : (
              <ShieldX className="w-12 h-12 mx-auto mb-2" />
            )}
            <h2 className="text-xl font-bold uppercase tracking-wide">
              {verdict === 'verified'
                ? 'VERIFIED'
                : verdict === 'flagged'
                ? 'FLAGGED FOR REVIEW'
                : 'REJECTED'}
            </h2>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Candidate Info */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
            className="glass-card p-4 space-y-3"
          >
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">CANDIDATE PROFILE</h3>
            
            <div className="flex items-center gap-3">
              <UserCheck className="w-4 h-4 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Name</p>
                <p className="text-sm font-medium text-foreground">{candidateName}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <School className="w-4 h-4 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Institution</p>
                <p className="text-sm font-medium text-foreground">{institution}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <FileWarning className="w-4 h-4 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Document</p>
                <p className="text-sm font-medium text-foreground">{documentType}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <BookOpen className="w-4 h-4 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Mean Grade</p>
                <p className="text-sm font-medium text-primary">{meanGrade}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <TrendingUp className="w-4 h-4 text-success" />
              <div>
                <p className="text-xs text-muted-foreground">OCR Confidence</p>
                <p className="text-sm font-medium text-success">
                  {ocrResult ? `${(ocrResult.confidence * 100).toFixed(0)}%` : 'N/A'}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Anomalies List */}
      <AnimatePresence>
        {showResults && anomalies.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6 }}
            className="glass-card p-4"
          >
            <h3 className="text-sm font-semibold text-danger mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              ANOMALIES DETECTED ({anomalies.length})
            </h3>
            <ul className="space-y-2">
              {anomalies.map((anomaly, idx) => (
                <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-danger rounded-full mt-1.5 shrink-0" />
                  {anomaly}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8 }}
            className="space-y-3"
          >
            <Button
              onClick={handleApprove}
              className="w-full bg-success hover:bg-success/90 text-success-foreground font-semibold"
            >
              <CheckCircle2 className="w-5 h-5 mr-2" />
              Approve Enrollment
            </Button>
            <Button
              onClick={handleReject}
              variant="destructive"
              className="w-full font-semibold"
            >
              <XCircle className="w-5 h-5 mr-2" />
              Reject & Report
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Validation & Export */}
      <AnimatePresence>
        {showResults && (
          <>
            <ValidationDisplay ocrResult={ocrResult || null} />
            <ExportReports 
              ocrResult={ocrResult || null} 
              biometricScore={biometricScore}
              candidateName={ocrResult?.structured?.studentName}
            />
          </>
        )}
      </AnimatePresence>

      {!showResults && (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <ShieldCheck className="w-16 h-16 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">Awaiting scan results...</p>
          <p className="text-xs text-muted-foreground mt-1">Upload a document and initiate scan</p>
        </div>
      )}
    </motion.aside>
  );
}
