export interface SubjectGrade {
  name: string;
  grade: string;
  points?: number;
}

export interface StructuredData {
  studentName?: string;
  indexNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  schoolName?: string;
  schoolCode?: string;
  county?: string;
  yearOfExam?: string;
  certificateNumber?: string;
  subjects?: SubjectGrade[];
  meanGrade?: string;
  meanPoints?: string;
  totalPoints?: number;
}

export interface VerificationElements {
  hasWatermark?: boolean;
  hasQRCode?: boolean;
  hasOfficialStamp?: boolean;
  hasSignature?: boolean;
  stampText?: string;
}

export interface OCRResult {
  rawText: string;
  structured: StructuredData | null;
  verificationElements: VerificationElements | null;
  confidence: number;
  notes?: string;
}

export interface OCRResponse {
  success: boolean;
  data?: OCRResult;
  error?: string;
}
