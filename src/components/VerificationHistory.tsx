import { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Shield, ShieldCheck, ShieldX, AlertTriangle, ChevronRight, User, School, Loader2, RefreshCw } from 'lucide-react';
import { SearchFilter, VerificationRecord } from './SearchFilter';
import { ExportReports } from './ExportReports';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface VerificationHistoryProps {
  onSelectRecord?: (record: VerificationRecord) => void;
}

export function VerificationHistory({ onSelectRecord }: VerificationHistoryProps) {
  const [filteredRecords, setFilteredRecords] = useState<VerificationRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<VerificationRecord | null>(null);

  const { data: records = [], isLoading, refetch } = useQuery({
    queryKey: ['verification-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('verifications')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform to VerificationRecord format
      return data.map((v): VerificationRecord => ({
        id: v.id,
        candidateName: v.student_name || 'Unknown Candidate',
        indexNumber: v.index_number || 'N/A',
        institution: v.institution || 'Unknown Institution',
        meanGrade: 'N/A',
        verdict: v.verdict as 'verified' | 'flagged' | 'rejected',
        riskScore: v.risk_score || 0,
        createdAt: new Date(v.created_at),
        ocrConfidence: v.ocr_confidence ? Number(v.ocr_confidence) / 100 : 0,
      }));
    },
  });

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel('verifications-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'verifications' },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">
          {records.length} Verification Records
        </h3>
        <Button variant="ghost" size="sm" onClick={() => refetch()} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Search & Filter */}
      <SearchFilter records={records} onFilteredRecords={handleFilteredRecords} />

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
              <p className="text-muted-foreground">
                {records.length === 0 ? 'No verification records yet. Start a scan to create records.' : 'No records match your search criteria'}
              </p>
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
                      <p className="text-xs text-muted-foreground">Confidence</p>
                      <p className="font-semibold text-primary">{(record.ocrConfidence * 100).toFixed(0)}%</p>
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
