import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, AlertTriangle, Shield, FileText, User, GraduationCap } from 'lucide-react';
import { OCRResult } from '@/types/ocr';
import { 
  validateOCRResult, 
  validateStudentData, 
  validateAcademicData, 
  validateVerificationElements,
  ValidationResult 
} from '@/lib/validation';

interface ValidationDisplayProps {
  ocrResult: OCRResult | null;
}

interface ValidationItemProps {
  label: string;
  isValid: boolean;
  detail?: string;
}

function ValidationItem({ label, isValid, detail }: ValidationItemProps) {
  return (
    <div className="flex items-center gap-2 py-1">
      {isValid ? (
        <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
      ) : (
        <XCircle className="w-4 h-4 text-danger shrink-0" />
      )}
      <span className={`text-sm ${isValid ? 'text-foreground' : 'text-muted-foreground'}`}>
        {label}
      </span>
      {detail && (
        <span className="text-xs text-muted-foreground ml-auto">{detail}</span>
      )}
    </div>
  );
}

export function ValidationDisplay({ ocrResult }: ValidationDisplayProps) {
  const validation = validateOCRResult(ocrResult);
  const studentVal = validateStudentData(ocrResult?.structured || null);
  const academicVal = validateAcademicData(ocrResult?.structured || null);
  const verifyVal = validateVerificationElements(ocrResult?.verificationElements || null);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-danger';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4 space-y-4"
    >
      {/* Header with Score */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" />
          DATA VALIDATION
        </h3>
        <div className={`text-lg font-bold ${getScoreColor(validation.score)}`}>
          {validation.score}%
        </div>
      </div>

      {/* Student Data Validation */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <User className="w-3 h-3" />
          STUDENT DATA
        </div>
        <ValidationItem 
          label="Student Name" 
          isValid={studentVal.nameValid}
          detail={ocrResult?.structured?.studentName || 'Not found'}
        />
        <ValidationItem 
          label="Index Number" 
          isValid={studentVal.indexNumberValid}
          detail={ocrResult?.structured?.indexNumber || 'Invalid'}
        />
        <ValidationItem 
          label="Date of Birth" 
          isValid={studentVal.dobValid}
          detail={ocrResult?.structured?.dateOfBirth || 'Not detected'}
        />
        <ValidationItem 
          label="Gender" 
          isValid={studentVal.genderValid}
          detail={ocrResult?.structured?.gender || 'Not found'}
        />
      </div>

      {/* Academic Data Validation */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <GraduationCap className="w-3 h-3" />
          ACADEMIC DATA
        </div>
        <ValidationItem 
          label="Mean Grade" 
          isValid={academicVal.meanGradeValid}
          detail={ocrResult?.structured?.meanGrade || 'Not found'}
        />
        <ValidationItem 
          label="Subject Grades" 
          isValid={academicVal.gradesValid}
          detail={`${ocrResult?.structured?.subjects?.length || 0} subjects`}
        />
        <ValidationItem 
          label="Points Calculation" 
          isValid={academicVal.pointsValid}
          detail={ocrResult?.structured?.totalPoints?.toString() || 'N/A'}
        />
        <ValidationItem 
          label="Required Subjects" 
          isValid={academicVal.subjectsComplete}
        />
      </div>

      {/* Security Elements */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <FileText className="w-3 h-3" />
          SECURITY ELEMENTS
        </div>
        {verifyVal.presentElements.map((elem) => (
          <ValidationItem key={elem} label={elem} isValid={true} />
        ))}
        {verifyVal.missingElements.map((elem) => (
          <ValidationItem key={elem} label={elem} isValid={false} detail="Not detected" />
        ))}
      </div>

      {/* Errors & Warnings */}
      {(validation.errors.length > 0 || validation.warnings.length > 0) && (
        <div className="border-t border-border pt-3 space-y-2">
          {validation.errors.map((error, idx) => (
            <div key={idx} className="flex items-start gap-2 text-sm text-danger">
              <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
              {error}
            </div>
          ))}
          {validation.warnings.map((warning, idx) => (
            <div key={idx} className="flex items-start gap-2 text-sm text-warning">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              {warning}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
