import { OCRResult, StructuredData, VerificationElements } from '@/types/ocr';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  score: number; // 0-100 validation quality score
}

export interface StudentValidation {
  nameValid: boolean;
  indexNumberValid: boolean;
  dobValid: boolean;
  genderValid: boolean;
}

export interface AcademicValidation {
  gradesValid: boolean;
  meanGradeValid: boolean;
  pointsValid: boolean;
  subjectsComplete: boolean;
}

// Kenya index number format: XXXXX/YYYY or similar patterns
const INDEX_NUMBER_PATTERNS = [
  /^\d{8,12}\/\d{4}$/,  // Standard format: 12345678/2023
  /^\d{2,4}\/\d{3,5}\/\d{4}$/,  // Alternative: 01/234/2023
  /^[A-Z]{1,3}\d{6,10}$/,  // Code format: ABC1234567
];

// Valid KCSE grades
const VALID_GRADES = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'E'];

// Grade to points mapping
const GRADE_POINTS: Record<string, number> = {
  'A': 12, 'A-': 11, 'B+': 10, 'B': 9, 'B-': 8,
  'C+': 7, 'C': 6, 'C-': 5, 'D+': 4, 'D': 3, 'D-': 2, 'E': 1
};

// Required KCSE subjects (compulsory)
const REQUIRED_SUBJECTS = [
  'english', 'kiswahili', 'mathematics', 'math'
];

export function validateIndexNumber(indexNumber: string): boolean {
  if (!indexNumber) return false;
  const cleaned = indexNumber.trim().toUpperCase();
  return INDEX_NUMBER_PATTERNS.some(pattern => pattern.test(cleaned));
}

export function validateGrade(grade: string): boolean {
  if (!grade) return false;
  return VALID_GRADES.includes(grade.toUpperCase().trim());
}

export function validateDateOfBirth(dob: string): { valid: boolean; date?: Date } {
  if (!dob) return { valid: false };
  
  // Try different date formats
  const patterns = [
    /^(\d{2})\/(\d{2})\/(\d{4})$/, // DD/MM/YYYY
    /^(\d{4})-(\d{2})-(\d{2})$/, // YYYY-MM-DD
    /^(\d{2})-(\d{2})-(\d{4})$/, // DD-MM-YYYY
  ];
  
  for (const pattern of patterns) {
    const match = dob.match(pattern);
    if (match) {
      let day: number, month: number, year: number;
      
      if (pattern === patterns[1]) {
        [, year, month, day] = match.map(Number) as [string, number, number, number];
      } else {
        [, day, month, year] = match.map(Number) as [string, number, number, number];
      }
      
      const date = new Date(year, month - 1, day);
      const now = new Date();
      const age = now.getFullYear() - year;
      
      // Reasonable age range for KCSE candidates (15-30 years)
      if (age >= 15 && age <= 40 && date <= now) {
        return { valid: true, date };
      }
    }
  }
  
  return { valid: false };
}

export function validateStudentData(data: StructuredData | null): StudentValidation {
  if (!data) {
    return { nameValid: false, indexNumberValid: false, dobValid: false, genderValid: false };
  }
  
  return {
    nameValid: !!(data.studentName && data.studentName.length >= 3),
    indexNumberValid: validateIndexNumber(data.indexNumber || ''),
    dobValid: validateDateOfBirth(data.dateOfBirth || '').valid,
    genderValid: ['male', 'female', 'm', 'f'].includes((data.gender || '').toLowerCase()),
  };
}

export function validateAcademicData(data: StructuredData | null): AcademicValidation {
  if (!data) {
    return { gradesValid: false, meanGradeValid: false, pointsValid: false, subjectsComplete: false };
  }
  
  const subjects = data.subjects || [];
  const allGradesValid = subjects.every(s => validateGrade(s.grade));
  const meanGradeValid = validateGrade(data.meanGrade || '');
  
  // Check if points are consistent
  let pointsValid = true;
  if (subjects.length > 0 && data.totalPoints !== undefined) {
    const calculatedPoints = subjects.reduce((sum, s) => sum + (s.points || 0), 0);
    pointsValid = Math.abs(calculatedPoints - (data.totalPoints || 0)) <= 1; // Allow 1 point margin
  }
  
  // Check if required subjects are present
  const subjectNames = subjects.map(s => s.name.toLowerCase());
  const hasRequiredSubjects = REQUIRED_SUBJECTS.some(req => 
    subjectNames.some(name => name.includes(req))
  );
  
  return {
    gradesValid: allGradesValid,
    meanGradeValid,
    pointsValid,
    subjectsComplete: subjects.length >= 7 && hasRequiredSubjects, // Min 7 subjects for KCSE
  };
}

export function validateVerificationElements(elements: VerificationElements | null): {
  hasSecurityFeatures: boolean;
  missingElements: string[];
  presentElements: string[];
} {
  if (!elements) {
    return {
      hasSecurityFeatures: false,
      missingElements: ['watermark', 'QR code', 'official stamp', 'signature'],
      presentElements: [],
    };
  }
  
  const missing: string[] = [];
  const present: string[] = [];
  
  if (elements.hasWatermark) present.push('watermark');
  else missing.push('watermark');
  
  if (elements.hasQRCode) present.push('QR code');
  else missing.push('QR code');
  
  if (elements.hasOfficialStamp) present.push('official stamp');
  else missing.push('official stamp');
  
  if (elements.hasSignature) present.push('signature');
  else missing.push('signature');
  
  return {
    hasSecurityFeatures: present.length >= 2, // At least 2 security features
    missingElements: missing,
    presentElements: present,
  };
}

export function validateOCRResult(result: OCRResult | null): ValidationResult {
  if (!result) {
    return {
      isValid: false,
      errors: ['No OCR data available'],
      warnings: [],
      score: 0,
    };
  }
  
  const errors: string[] = [];
  const warnings: string[] = [];
  let score = 100;
  
  // Check confidence
  if (result.confidence < 0.5) {
    errors.push('OCR confidence too low - document may be unreadable');
    score -= 30;
  } else if (result.confidence < 0.7) {
    warnings.push('OCR confidence below optimal level');
    score -= 15;
  }
  
  // Validate student data
  const studentVal = validateStudentData(result.structured);
  if (!studentVal.nameValid) {
    errors.push('Student name not found or invalid');
    score -= 15;
  }
  if (!studentVal.indexNumberValid) {
    errors.push('Index number format invalid or missing');
    score -= 10;
  }
  if (!studentVal.dobValid) {
    warnings.push('Date of birth not detected or invalid format');
    score -= 5;
  }
  
  // Validate academic data
  const academicVal = validateAcademicData(result.structured);
  if (!academicVal.meanGradeValid) {
    warnings.push('Mean grade not detected or invalid');
    score -= 10;
  }
  if (!academicVal.subjectsComplete) {
    warnings.push('Subject list may be incomplete (expected min. 7 subjects)');
    score -= 5;
  }
  if (!academicVal.pointsValid) {
    warnings.push('Points calculation inconsistency detected');
    score -= 5;
  }
  
  // Validate verification elements
  const verifyVal = validateVerificationElements(result.verificationElements);
  if (!verifyVal.hasSecurityFeatures) {
    errors.push(`Missing security features: ${verifyVal.missingElements.join(', ')}`);
    score -= 20;
  } else if (verifyVal.missingElements.length > 2) {
    warnings.push(`Some security features not detected: ${verifyVal.missingElements.join(', ')}`);
    score -= 10;
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    score: Math.max(0, score),
  };
}

export function calculateOverallRiskScore(
  ocrResult: OCRResult | null,
  biometricScore?: number,
  livenessScore?: number
): {
  riskScore: number;
  verdict: 'verified' | 'flagged' | 'rejected';
  factors: { name: string; impact: number; status: 'good' | 'warning' | 'bad' }[];
} {
  const factors: { name: string; impact: number; status: 'good' | 'warning' | 'bad' }[] = [];
  let totalRisk = 0;
  
  // OCR Confidence Factor
  if (ocrResult) {
    const ocrRisk = 100 - (ocrResult.confidence * 100);
    factors.push({
      name: 'OCR Confidence',
      impact: ocrRisk,
      status: ocrRisk < 20 ? 'good' : ocrRisk < 40 ? 'warning' : 'bad',
    });
    totalRisk += ocrRisk * 0.3;
    
    // Security Elements Factor
    const verifyVal = validateVerificationElements(ocrResult.verificationElements);
    const securityRisk = verifyVal.missingElements.length * 15;
    factors.push({
      name: 'Security Elements',
      impact: securityRisk,
      status: securityRisk < 20 ? 'good' : securityRisk < 40 ? 'warning' : 'bad',
    });
    totalRisk += securityRisk * 0.25;
    
    // Data Completeness Factor
    const validation = validateOCRResult(ocrResult);
    const dataRisk = 100 - validation.score;
    factors.push({
      name: 'Data Completeness',
      impact: dataRisk,
      status: dataRisk < 20 ? 'good' : dataRisk < 40 ? 'warning' : 'bad',
    });
    totalRisk += dataRisk * 0.2;
  } else {
    totalRisk += 50;
    factors.push({ name: 'OCR Data', impact: 100, status: 'bad' });
  }
  
  // Biometric Factor
  if (biometricScore !== undefined) {
    const bioRisk = 100 - biometricScore;
    factors.push({
      name: 'Biometric Match',
      impact: bioRisk,
      status: bioRisk < 20 ? 'good' : bioRisk < 40 ? 'warning' : 'bad',
    });
    totalRisk += bioRisk * 0.15;
  }
  
  // Liveness Factor
  if (livenessScore !== undefined) {
    const livenessRisk = 100 - livenessScore;
    factors.push({
      name: 'Liveness Check',
      impact: livenessRisk,
      status: livenessRisk < 20 ? 'good' : livenessRisk < 40 ? 'warning' : 'bad',
    });
    totalRisk += livenessRisk * 0.1;
  }
  
  const riskScore = Math.min(100, Math.max(0, Math.round(totalRisk)));
  
  let verdict: 'verified' | 'flagged' | 'rejected';
  if (riskScore <= 25) verdict = 'verified';
  else if (riskScore <= 55) verdict = 'flagged';
  else verdict = 'rejected';
  
  return { riskScore, verdict, factors };
}
