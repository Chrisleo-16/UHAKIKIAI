import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ShieldX, AlertTriangle, CheckCircle2, XCircle, UserCheck, FileWarning, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface DecisionPanelProps {
  showResults: boolean;
  result?: {
    candidate: string;
    institution: string;
    documentType: string;
    faceMatch: number;
    riskScore: number;
    anomalies: string[];
    verdict: 'verified' | 'flagged' | 'rejected';
  };
}

export function DecisionPanel({ showResults, result }: DecisionPanelProps) {
  const mockResult = result || {
    candidate: 'Leo Chrisben Evans',
    institution: 'University of Nairobi',
    documentType: 'KCSE Certificate',
    faceMatch: 98.2,
    riskScore: 85,
    anomalies: ['Mean Grade manipulation', 'Signature artifacts'],
    verdict: 'flagged' as const,
  };

  const handleApprove = () => {
    toast.success('Enrollment Approved', {
      description: `${mockResult.candidate} has been cleared for enrollment.`,
      icon: <CheckCircle2 className="w-5 h-5 text-success" />,
    });
  };

  const handleReject = () => {
    toast.error('Application Rejected & Reported', {
      description: 'Case file has been forwarded to fraud investigation unit.',
      icon: <XCircle className="w-5 h-5 text-danger" />,
    });
  };

  const riskAngle = (mockResult.riskScore / 100) * 180;

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
                <span className="text-4xl font-bold text-danger">{mockResult.riskScore}%</span>
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
              mockResult.verdict === 'verified'
                ? 'bg-success/10 border-success text-success'
                : mockResult.verdict === 'flagged'
                ? 'bg-warning/10 border-warning text-warning'
                : 'bg-danger/10 border-danger text-danger'
            }`}
          >
            {mockResult.verdict === 'verified' ? (
              <ShieldCheck className="w-12 h-12 mx-auto mb-2" />
            ) : mockResult.verdict === 'flagged' ? (
              <AlertTriangle className="w-12 h-12 mx-auto mb-2" />
            ) : (
              <ShieldX className="w-12 h-12 mx-auto mb-2" />
            )}
            <h2 className="text-xl font-bold uppercase tracking-wide">
              {mockResult.verdict === 'verified'
                ? 'VERIFIED'
                : mockResult.verdict === 'flagged'
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
                <p className="text-sm font-medium text-foreground">{mockResult.candidate}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <FileWarning className="w-4 h-4 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Document</p>
                <p className="text-sm font-medium text-foreground">{mockResult.documentType}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <TrendingUp className="w-4 h-4 text-success" />
              <div>
                <p className="text-xs text-muted-foreground">Face Match</p>
                <p className="text-sm font-medium text-success">{mockResult.faceMatch}%</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Anomalies List */}
      <AnimatePresence>
        {showResults && mockResult.anomalies.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6 }}
            className="glass-card p-4"
          >
            <h3 className="text-sm font-semibold text-danger mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              ANOMALIES DETECTED
            </h3>
            <ul className="space-y-2">
              {mockResult.anomalies.map((anomaly, idx) => (
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

      {/* Placeholder when no results */}
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
