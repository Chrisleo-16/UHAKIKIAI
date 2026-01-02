import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, FileSpreadsheet, FileJson, Printer, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { OCRResult } from '@/types/ocr';
import { validateOCRResult, calculateOverallRiskScore } from '@/lib/validation';

interface ExportReportsProps {
  ocrResult: OCRResult | null;
  biometricScore?: number;
  livenessScore?: number;
  candidateName?: string;
}

type ExportFormat = 'pdf' | 'csv' | 'json';

function generateReportData(props: ExportReportsProps) {
  const { ocrResult, biometricScore, livenessScore, candidateName } = props;
  const validation = validateOCRResult(ocrResult);
  const riskAnalysis = calculateOverallRiskScore(ocrResult, biometricScore, livenessScore);
  
  return {
    reportId: `VER-${Date.now().toString(36).toUpperCase()}`,
    generatedAt: new Date().toISOString(),
    candidate: {
      name: candidateName || ocrResult?.structured?.studentName || 'Unknown',
      indexNumber: ocrResult?.structured?.indexNumber || 'N/A',
      dateOfBirth: ocrResult?.structured?.dateOfBirth || 'N/A',
      gender: ocrResult?.structured?.gender || 'N/A',
      institution: ocrResult?.structured?.schoolName || 'N/A',
      schoolCode: ocrResult?.structured?.schoolCode || 'N/A',
      county: ocrResult?.structured?.county || 'N/A',
    },
    academic: {
      yearOfExam: ocrResult?.structured?.yearOfExam || 'N/A',
      meanGrade: ocrResult?.structured?.meanGrade || 'N/A',
      meanPoints: ocrResult?.structured?.meanPoints || 'N/A',
      totalPoints: ocrResult?.structured?.totalPoints || 'N/A',
      subjects: ocrResult?.structured?.subjects || [],
    },
    verification: {
      ocrConfidence: ocrResult?.confidence ? (ocrResult.confidence * 100).toFixed(1) + '%' : 'N/A',
      biometricScore: biometricScore ? biometricScore.toFixed(1) + '%' : 'N/A',
      livenessScore: livenessScore ? livenessScore.toFixed(1) + '%' : 'N/A',
      riskScore: riskAnalysis.riskScore + '%',
      verdict: riskAnalysis.verdict.toUpperCase(),
      validationScore: validation.score + '%',
    },
    securityElements: {
      watermark: ocrResult?.verificationElements?.hasWatermark ? 'Detected' : 'Not Detected',
      qrCode: ocrResult?.verificationElements?.hasQRCode ? 'Detected' : 'Not Detected',
      officialStamp: ocrResult?.verificationElements?.hasOfficialStamp ? 'Detected' : 'Not Detected',
      signature: ocrResult?.verificationElements?.hasSignature ? 'Detected' : 'Not Detected',
    },
    issues: {
      errors: validation.errors,
      warnings: validation.warnings,
    },
    riskFactors: riskAnalysis.factors,
  };
}

function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function exportAsJSON(data: ReturnType<typeof generateReportData>) {
  const content = JSON.stringify(data, null, 2);
  downloadFile(content, `verification-report-${data.reportId}.json`, 'application/json');
}

function exportAsCSV(data: ReturnType<typeof generateReportData>) {
  const rows = [
    ['Verification Report', data.reportId],
    ['Generated At', data.generatedAt],
    [''],
    ['CANDIDATE INFORMATION'],
    ['Name', data.candidate.name],
    ['Index Number', data.candidate.indexNumber],
    ['Date of Birth', data.candidate.dateOfBirth],
    ['Gender', data.candidate.gender],
    ['Institution', data.candidate.institution],
    ['School Code', data.candidate.schoolCode],
    ['County', data.candidate.county],
    [''],
    ['ACADEMIC RESULTS'],
    ['Year of Exam', data.academic.yearOfExam],
    ['Mean Grade', data.academic.meanGrade],
    ['Mean Points', data.academic.meanPoints],
    ['Total Points', String(data.academic.totalPoints)],
    [''],
    ['SUBJECTS'],
    ['Subject', 'Grade', 'Points'],
    ...data.academic.subjects.map(s => [s.name, s.grade, String(s.points || '')]),
    [''],
    ['VERIFICATION RESULTS'],
    ['OCR Confidence', data.verification.ocrConfidence],
    ['Biometric Score', data.verification.biometricScore],
    ['Liveness Score', data.verification.livenessScore],
    ['Risk Score', data.verification.riskScore],
    ['Verdict', data.verification.verdict],
    ['Validation Score', data.verification.validationScore],
    [''],
    ['SECURITY ELEMENTS'],
    ['Watermark', data.securityElements.watermark],
    ['QR Code', data.securityElements.qrCode],
    ['Official Stamp', data.securityElements.officialStamp],
    ['Signature', data.securityElements.signature],
    [''],
    ['ISSUES'],
    ['Errors', data.issues.errors.join('; ') || 'None'],
    ['Warnings', data.issues.warnings.join('; ') || 'None'],
  ];
  
  const csv = rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  downloadFile(csv, `verification-report-${data.reportId}.csv`, 'text/csv');
}

function generatePrintableHTML(data: ReturnType<typeof generateReportData>): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>Verification Report - ${data.reportId}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
    h1 { color: #00FFA3; border-bottom: 2px solid #00FFA3; padding-bottom: 10px; }
    h2 { color: #333; margin-top: 30px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    th, td { padding: 10px; text-align: left; border: 1px solid #ddd; }
    th { background: #f5f5f5; }
    .verdict { font-size: 24px; font-weight: bold; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0; }
    .verified { background: #d4edda; color: #155724; }
    .flagged { background: #fff3cd; color: #856404; }
    .rejected { background: #f8d7da; color: #721c24; }
    .meta { color: #666; font-size: 12px; margin-bottom: 20px; }
    .section { margin-bottom: 30px; }
    .risk-factor { padding: 8px; margin: 5px 0; border-radius: 4px; }
    .good { background: #d4edda; }
    .warning { background: #fff3cd; }
    .bad { background: #f8d7da; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <h1>🔒 UhakikiAI Verification Report</h1>
  <p class="meta">Report ID: ${data.reportId} | Generated: ${new Date(data.generatedAt).toLocaleString()}</p>
  
  <div class="verdict ${data.verification.verdict.toLowerCase()}">
    ${data.verification.verdict === 'VERIFIED' ? '✓ VERIFIED' : 
      data.verification.verdict === 'FLAGGED' ? '⚠ FLAGGED FOR REVIEW' : '✗ REJECTED'}
    <br><small>Risk Score: ${data.verification.riskScore}</small>
  </div>
  
  <div class="section">
    <h2>Candidate Information</h2>
    <table>
      <tr><th>Name</th><td>${data.candidate.name}</td></tr>
      <tr><th>Index Number</th><td>${data.candidate.indexNumber}</td></tr>
      <tr><th>Date of Birth</th><td>${data.candidate.dateOfBirth}</td></tr>
      <tr><th>Gender</th><td>${data.candidate.gender}</td></tr>
      <tr><th>Institution</th><td>${data.candidate.institution}</td></tr>
      <tr><th>School Code</th><td>${data.candidate.schoolCode}</td></tr>
      <tr><th>County</th><td>${data.candidate.county}</td></tr>
    </table>
  </div>
  
  <div class="section">
    <h2>Academic Results</h2>
    <table>
      <tr><th>Year of Exam</th><td>${data.academic.yearOfExam}</td></tr>
      <tr><th>Mean Grade</th><td><strong>${data.academic.meanGrade}</strong></td></tr>
      <tr><th>Total Points</th><td>${data.academic.totalPoints}</td></tr>
    </table>
    
    ${data.academic.subjects.length > 0 ? `
    <h3>Subject Breakdown</h3>
    <table>
      <tr><th>Subject</th><th>Grade</th><th>Points</th></tr>
      ${data.academic.subjects.map(s => `<tr><td>${s.name}</td><td>${s.grade}</td><td>${s.points || '-'}</td></tr>`).join('')}
    </table>
    ` : ''}
  </div>
  
  <div class="section">
    <h2>Verification Scores</h2>
    <table>
      <tr><th>OCR Confidence</th><td>${data.verification.ocrConfidence}</td></tr>
      <tr><th>Biometric Match</th><td>${data.verification.biometricScore}</td></tr>
      <tr><th>Liveness Score</th><td>${data.verification.livenessScore}</td></tr>
      <tr><th>Validation Score</th><td>${data.verification.validationScore}</td></tr>
    </table>
  </div>
  
  <div class="section">
    <h2>Security Elements</h2>
    <table>
      <tr><th>Watermark</th><td>${data.securityElements.watermark}</td></tr>
      <tr><th>QR Code</th><td>${data.securityElements.qrCode}</td></tr>
      <tr><th>Official Stamp</th><td>${data.securityElements.officialStamp}</td></tr>
      <tr><th>Signature</th><td>${data.securityElements.signature}</td></tr>
    </table>
  </div>
  
  ${data.issues.errors.length > 0 || data.issues.warnings.length > 0 ? `
  <div class="section">
    <h2>Issues Detected</h2>
    ${data.issues.errors.map(e => `<p style="color: #dc3545;">❌ ${e}</p>`).join('')}
    ${data.issues.warnings.map(w => `<p style="color: #ffc107;">⚠️ ${w}</p>`).join('')}
  </div>
  ` : ''}
  
  <div class="section">
    <h2>Risk Factors</h2>
    ${data.riskFactors.map(f => `
      <div class="risk-factor ${f.status}">
        <strong>${f.name}</strong>: ${f.impact.toFixed(0)}% impact
      </div>
    `).join('')}
  </div>
  
  <hr>
  <p class="meta" style="text-align: center;">
    This report was generated by UhakikiAI Identity Verification System.<br>
    For queries, contact: support@uhakiki.ai
  </p>
</body>
</html>
  `;
}

function exportAsPDF(data: ReturnType<typeof generateReportData>) {
  const html = generatePrintableHTML(data);
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  }
}

export function ExportReports({ ocrResult, biometricScore, livenessScore, candidateName }: ExportReportsProps) {
  const [isExporting, setIsExporting] = useState<ExportFormat | null>(null);
  
  const handleExport = async (format: ExportFormat) => {
    setIsExporting(format);
    
    try {
      const data = generateReportData({ ocrResult, biometricScore, livenessScore, candidateName });
      
      switch (format) {
        case 'json':
          exportAsJSON(data);
          toast.success('JSON report downloaded');
          break;
        case 'csv':
          exportAsCSV(data);
          toast.success('CSV report downloaded');
          break;
        case 'pdf':
          exportAsPDF(data);
          toast.success('Print dialog opened');
          break;
      }
    } catch (error) {
      toast.error('Failed to export report');
      console.error('Export error:', error);
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4"
    >
      <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
        <Download className="w-4 h-4 text-primary" />
        EXPORT REPORT
      </h3>
      
      <div className="grid grid-cols-3 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleExport('pdf')}
          disabled={isExporting !== null}
          className="flex flex-col items-center gap-1 h-auto py-3"
        >
          <Printer className="w-4 h-4" />
          <span className="text-xs">Print/PDF</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleExport('csv')}
          disabled={isExporting !== null}
          className="flex flex-col items-center gap-1 h-auto py-3"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span className="text-xs">CSV</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleExport('json')}
          disabled={isExporting !== null}
          className="flex flex-col items-center gap-1 h-auto py-3"
        >
          <FileJson className="w-4 h-4" />
          <span className="text-xs">JSON</span>
        </Button>
      </div>
    </motion.div>
  );
}
