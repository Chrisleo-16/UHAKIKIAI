import { motion } from 'framer-motion';
import { User, School, Award, FileText, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { OCRResult } from '@/types/ocr';
import { Badge } from '@/components/ui/badge';

interface OCRResultsDisplayProps {
  result: OCRResult;
}

export function OCRResultsDisplay({ result }: OCRResultsDisplayProps) {
  const { structured, verificationElements, confidence, notes } = result;

  const confidenceColor = confidence >= 0.8 ? 'text-success' : confidence >= 0.5 ? 'text-warning' : 'text-danger';
  const confidenceLabel = confidence >= 0.8 ? 'High' : confidence >= 0.5 ? 'Medium' : 'Low';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Confidence Score */}
      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border">
        <span className="text-sm text-muted-foreground">OCR Confidence</span>
        <div className="flex items-center gap-2">
          <span className={`text-lg font-bold ${confidenceColor}`}>
            {(confidence * 100).toFixed(0)}%
          </span>
          <Badge variant={confidence >= 0.8 ? 'default' : confidence >= 0.5 ? 'secondary' : 'destructive'}>
            {confidenceLabel}
          </Badge>
        </div>
      </div>

      {/* Student Information */}
      {structured && (
        <>
          <div className="glass-card p-4">
            <h4 className="text-sm font-semibold text-primary flex items-center gap-2 mb-3">
              <User className="w-4 h-4" />
              Student Information
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {structured.studentName && (
                <div>
                  <span className="text-muted-foreground">Name:</span>
                  <p className="font-medium text-foreground">{structured.studentName}</p>
                </div>
              )}
              {structured.indexNumber && (
                <div>
                  <span className="text-muted-foreground">Index No:</span>
                  <p className="font-mono text-foreground">{structured.indexNumber}</p>
                </div>
              )}
              {structured.dateOfBirth && (
                <div>
                  <span className="text-muted-foreground">DOB:</span>
                  <p className="text-foreground">{structured.dateOfBirth}</p>
                </div>
              )}
              {structured.gender && (
                <div>
                  <span className="text-muted-foreground">Gender:</span>
                  <p className="text-foreground">{structured.gender}</p>
                </div>
              )}
            </div>
          </div>

          {/* Institution Details */}
          {(structured.schoolName || structured.county) && (
            <div className="glass-card p-4">
              <h4 className="text-sm font-semibold text-primary flex items-center gap-2 mb-3">
                <School className="w-4 h-4" />
                Institution Details
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {structured.schoolName && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground">School:</span>
                    <p className="font-medium text-foreground">{structured.schoolName}</p>
                  </div>
                )}
                {structured.schoolCode && (
                  <div>
                    <span className="text-muted-foreground">Code:</span>
                    <p className="font-mono text-foreground">{structured.schoolCode}</p>
                  </div>
                )}
                {structured.county && (
                  <div>
                    <span className="text-muted-foreground">County:</span>
                    <p className="text-foreground">{structured.county}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Academic Results */}
          {(structured.meanGrade || structured.subjects?.length) && (
            <div className="glass-card p-4">
              <h4 className="text-sm font-semibold text-primary flex items-center gap-2 mb-3">
                <Award className="w-4 h-4" />
                Academic Results
              </h4>
              
              {/* Mean Grade Display */}
              {structured.meanGrade && (
                <div className="flex items-center justify-between mb-3 p-2 bg-primary/10 rounded-lg border border-primary/30">
                  <span className="text-sm text-foreground">Mean Grade</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-primary">{structured.meanGrade}</span>
                    {structured.meanPoints && (
                      <span className="text-muted-foreground">({structured.meanPoints} pts)</span>
                    )}
                  </div>
                </div>
              )}

              {/* Subject Grades */}
              {structured.subjects && structured.subjects.length > 0 && (
                <div className="grid grid-cols-3 gap-2 text-sm">
                  {structured.subjects.map((subject, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 bg-muted/30 rounded">
                      <span className="text-muted-foreground truncate">{subject.name}</span>
                      <Badge variant="outline" className="ml-2">{subject.grade}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Verification Elements */}
      {verificationElements && (
        <div className="glass-card p-4">
          <h4 className="text-sm font-semibold text-primary flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4" />
            Verification Elements Detected
          </h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <VerificationItem label="Watermark" detected={verificationElements.hasWatermark} />
            <VerificationItem label="QR Code" detected={verificationElements.hasQRCode} />
            <VerificationItem label="Official Stamp" detected={verificationElements.hasOfficialStamp} />
            <VerificationItem label="Signature" detected={verificationElements.hasSignature} />
          </div>
        </div>
      )}

      {/* Notes */}
      {notes && (
        <div className="flex items-start gap-2 p-3 bg-warning/10 rounded-lg border border-warning/30">
          <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
          <p className="text-sm text-warning">{notes}</p>
        </div>
      )}
    </motion.div>
  );
}

function VerificationItem({ label, detected }: { label: string; detected?: boolean }) {
  return (
    <div className="flex items-center gap-2 p-2 bg-muted/30 rounded">
      {detected ? (
        <CheckCircle className="w-4 h-4 text-success" />
      ) : (
        <XCircle className="w-4 h-4 text-muted-foreground" />
      )}
      <span className={detected ? 'text-foreground' : 'text-muted-foreground'}>{label}</span>
    </div>
  );
}
