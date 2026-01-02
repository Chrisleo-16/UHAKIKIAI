import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Shield, ShieldCheck, ShieldX, AlertTriangle, ChevronRight, User, School } from 'lucide-react';
import { SearchFilter, VerificationRecord } from './SearchFilter';
import { ExportReports } from './ExportReports';

// Mock data for demonstration
const mockRecords: VerificationRecord[] = [
  {
    id: '1',
    candidateName: 'John Kamau Mwangi',
    indexNumber: '12345678/2023',
    institution: 'Starehe Boys Centre',
    meanGrade: 'A',
    verdict: 'verified',
    riskScore: 15,
    createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
    ocrConfidence: 0.95,
  },
  {
    id: '2',
    candidateName: 'Mary Wanjiku Njoroge',
    indexNumber: '23456789/2023',
    institution: 'Kenya High School',
    meanGrade: 'A-',
    verdict: 'verified',
    riskScore: 22,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    ocrConfidence: 0.91,
  },
  {
    id: '3',
    candidateName: 'Peter Ochieng Otieno',
    indexNumber: '34567890/2023',
    institution: 'Maseno School',
    meanGrade: 'B+',
    verdict: 'flagged',
    riskScore: 45,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    ocrConfidence: 0.72,
  },
  {
    id: '4',
    candidateName: 'Grace Akinyi Ouma',
    indexNumber: '45678901/2023',
    institution: 'Pangani Girls',
    meanGrade: 'B',
    verdict: 'rejected',
    riskScore: 78,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    ocrConfidence: 0.45,
  },
  {
    id: '5',
    candidateName: 'David Kipchoge Korir',
    indexNumber: '56789012/2022',
    institution: 'Alliance High School',
    meanGrade: 'A',
    verdict: 'verified',
    riskScore: 12,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    ocrConfidence: 0.98,
  },
  {
    id: '6',
    candidateName: 'Sarah Chebet Rotich',
    indexNumber: '67890123/2023',
    institution: 'Moi Girls Eldoret',
    meanGrade: 'B+',
    verdict: 'flagged',
    riskScore: 52,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
    ocrConfidence: 0.68,
  },
];

interface VerificationHistoryProps {
  onSelectRecord?: (record: VerificationRecord) => void;
}

export function VerificationHistory({ onSelectRecord }: VerificationHistoryProps) {
  const [filteredRecords, setFilteredRecords] = useState<VerificationRecord[]>(mockRecords);
  const [selectedRecord, setSelectedRecord] = useState<VerificationRecord | null>(null);

  const handleFilteredRecords = useCallback((records: VerificationRecord[]) => {
    setFilteredRecords(records);
  }, []);

  const handleRecordClick = (record: VerificationRecord) => {
    setSelectedRecord(record);
    onSelectRecord?.(record);
  };

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case 'verified':
        return <ShieldCheck className="w-4 h-4 text-success" />;
      case 'flagged':
        return <AlertTriangle className="w-4 h-4 text-warning" />;
      case 'rejected':
        return <ShieldX className="w-4 h-4 text-danger" />;
      default:
        return <Shield className="w-4 h-4" />;
    }
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'verified':
        return 'bg-success/10 text-success border-success/30';
      case 'flagged':
        return 'bg-warning/10 text-warning border-warning/30';
      case 'rejected':
        return 'bg-danger/10 text-danger border-danger/30';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter */}
      <SearchFilter records={mockRecords} onFilteredRecords={handleFilteredRecords} />

      {/* Records List */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {filteredRecords.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card p-8 text-center"
            >
              <Shield className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No records match your search criteria</p>
            </motion.div>
          ) : (
            filteredRecords.map((record, index) => (
              <motion.div
                key={record.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleRecordClick(record)}
                className={`glass-card p-4 cursor-pointer transition-all hover:border-primary/50 ${
                  selectedRecord?.id === record.id ? 'border-primary' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Verdict Badge */}
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${getVerdictColor(record.verdict)}`}>
                    {getVerdictIcon(record.verdict)}
                  </div>

                  {/* Main Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-foreground truncate">{record.candidateName}</h4>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${getVerdictColor(record.verdict)}`}>
                        {record.verdict}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {record.indexNumber}
                      </span>
                      <span className="flex items-center gap-1">
                        <School className="w-3 h-3" />
                        {record.institution}
                      </span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="hidden sm:flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Grade</p>
                      <p className="font-semibold text-primary">{record.meanGrade}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Risk</p>
                      <p className={`font-semibold ${
                        record.riskScore > 60 ? 'text-danger' : 
                        record.riskScore > 30 ? 'text-warning' : 'text-success'
                      }`}>
                        {record.riskScore}%
                      </p>
                    </div>
                  </div>

                  {/* Time & Arrow */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTimeAgo(record.createdAt)}
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Export for Selected Record */}
      {selectedRecord && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ExportReports
            ocrResult={null}
            candidateName={selectedRecord.candidateName}
            biometricScore={80}
            livenessScore={85}
          />
        </motion.div>
      )}
    </div>
  );
}
