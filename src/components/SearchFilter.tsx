import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, X, Calendar, School, Shield, SortAsc, SortDesc } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface VerificationRecord {
  id: string;
  candidateName: string;
  indexNumber: string;
  institution: string;
  meanGrade: string;
  verdict: 'verified' | 'flagged' | 'rejected';
  riskScore: number;
  createdAt: Date;
  ocrConfidence: number;
}

interface SearchFilterProps {
  records: VerificationRecord[];
  onFilteredRecords: (records: VerificationRecord[]) => void;
}

type SortField = 'createdAt' | 'candidateName' | 'riskScore' | 'meanGrade';
type SortOrder = 'asc' | 'desc';

export function SearchFilter({ records, onFilteredRecords }: SearchFilterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [verdictFilter, setVerdictFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [showFilters, setShowFilters] = useState(false);

  const filteredRecords = useMemo(() => {
    let result = [...records];
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(r => 
        r.candidateName.toLowerCase().includes(query) ||
        r.indexNumber.toLowerCase().includes(query) ||
        r.institution.toLowerCase().includes(query)
      );
    }
    
    // Verdict filter
    if (verdictFilter !== 'all') {
      result = result.filter(r => r.verdict === verdictFilter);
    }
    
    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const cutoff = new Date();
      
      switch (dateFilter) {
        case 'today':
          cutoff.setHours(0, 0, 0, 0);
          break;
        case 'week':
          cutoff.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoff.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          cutoff.setMonth(now.getMonth() - 3);
          break;
      }
      
      result = result.filter(r => r.createdAt >= cutoff);
    }
    
    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'createdAt':
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
        case 'candidateName':
          comparison = a.candidateName.localeCompare(b.candidateName);
          break;
        case 'riskScore':
          comparison = a.riskScore - b.riskScore;
          break;
        case 'meanGrade':
          comparison = a.meanGrade.localeCompare(b.meanGrade);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    onFilteredRecords(result);
    return result;
  }, [records, searchQuery, verdictFilter, dateFilter, sortField, sortOrder, onFilteredRecords]);

  const clearFilters = () => {
    setSearchQuery('');
    setVerdictFilter('all');
    setDateFilter('all');
    setSortField('createdAt');
    setSortOrder('desc');
  };

  const hasActiveFilters = searchQuery || verdictFilter !== 'all' || dateFilter !== 'all';

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4 space-y-4"
    >
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, index number, or institution..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background/50"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
          className={showFilters ? 'border-primary text-primary' : ''}
        >
          <Filter className="w-4 h-4" />
        </Button>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="icon"
            onClick={clearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-border"
        >
          {/* Verdict Filter */}
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground flex items-center gap-1">
              <Shield className="w-3 h-3" /> Verdict
            </label>
            <Select value={verdictFilter} onValueChange={setVerdictFilter}>
              <SelectTrigger className="bg-background/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Verdicts</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="flagged">Flagged</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Filter */}
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Time Period
            </label>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="bg-background/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Past Week</SelectItem>
                <SelectItem value="month">Past Month</SelectItem>
                <SelectItem value="quarter">Past 3 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort Field */}
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Sort By</label>
            <Select value={sortField} onValueChange={(v) => setSortField(v as SortField)}>
              <SelectTrigger className="bg-background/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Date</SelectItem>
                <SelectItem value="candidateName">Name</SelectItem>
                <SelectItem value="riskScore">Risk Score</SelectItem>
                <SelectItem value="meanGrade">Mean Grade</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort Order */}
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Order</label>
            <Button
              variant="outline"
              className="w-full justify-start gap-2 bg-background/50"
              onClick={toggleSortOrder}
            >
              {sortOrder === 'asc' ? (
                <>
                  <SortAsc className="w-4 h-4" /> Ascending
                </>
              ) : (
                <>
                  <SortDesc className="w-4 h-4" /> Descending
                </>
              )}
            </Button>
          </div>
        </motion.div>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Showing <span className="text-foreground font-medium">{filteredRecords.length}</span> of {records.length} records
        </span>
        {hasActiveFilters && (
          <button 
            onClick={clearFilters}
            className="text-primary hover:underline text-sm"
          >
            Clear all filters
          </button>
        )}
      </div>
    </motion.div>
  );
}
