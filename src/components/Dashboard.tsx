import { useState, useCallback } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { ForensicScanner } from './ForensicScanner';
import { DecisionPanel } from './DecisionPanel';
import { VerificationHistory } from './VerificationHistory';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { AdminPanel } from './AdminPanel';
import { APIKeyManagement } from './APIKeyManagement';
import { OCRResult } from '@/types/ocr';

export function Dashboard() {
  const [activeTab, setActiveTab] = useState('scan');
  const [showResults, setShowResults] = useState(false);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [biometricScore, setBiometricScore] = useState<number | undefined>();

  const handleScanComplete = useCallback((result: OCRResult | null, bioMatch?: number) => {
    setShowResults(true);
    setOcrResult(result);
    setBiometricScore(bioMatch);
  }, []);

  const handleReset = useCallback(() => {
    setShowResults(false);
    setOcrResult(null);
    setBiometricScore(undefined);
  }, []);

  return (
    <div className="flex h-screen w-full bg-background cyber-grid overflow-hidden">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />

        <div className="flex-1 flex overflow-hidden">
          {activeTab === 'scan' && (
            <>
              <ForensicScanner onScanComplete={handleScanComplete} onReset={handleReset} />
              <DecisionPanel showResults={showResults} ocrResult={ocrResult} biometricScore={biometricScore} />
            </>
          )}

          {activeTab === 'dashboard' && <AnalyticsDashboard />}

          {activeTab === 'cases' && (
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold text-foreground mb-6">Verification History</h2>
                <VerificationHistory />
              </div>
            </div>
          )}

          {activeTab === 'admin' && <AdminPanel />}

          {activeTab === 'api-keys' && <APIKeyManagement />}

          {activeTab === 'settings' && (
            <div className="flex-1 p-6 flex items-center justify-center">
              <div className="glass-card p-12 text-center max-w-md">
                <h2 className="text-2xl font-bold text-foreground mb-2">Settings</h2>
                <p className="text-muted-foreground">
                  Configure system preferences and thresholds.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
