import { useState, useCallback } from 'react';
import { FolderOpen, Settings } from 'lucide-react';
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
              <div className="max-w-5xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/30">
                    <FolderOpen className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">Verification History</h2>
                    <p className="text-sm text-muted-foreground">View all past document verifications and their outcomes</p>
                  </div>
                </div>
                <VerificationHistory />
              </div>
            </div>
          )}

          {activeTab === 'admin' && <AdminPanel />}

          {activeTab === 'api-keys' && <APIKeyManagement />}

          {activeTab === 'settings' && (
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/30">
                    <Settings className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">Settings</h2>
                    <p className="text-sm text-muted-foreground">Configure system preferences and thresholds</p>
                  </div>
                </div>
                
                <div className="glass-card p-6 space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Verification Settings</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                        <div>
                          <p className="font-medium">Auto-reject Low Confidence</p>
                          <p className="text-sm text-muted-foreground">Automatically reject documents with {"<"}50% confidence</p>
                        </div>
                        <div className="w-10 h-6 bg-primary/20 rounded-full flex items-center px-1">
                          <div className="w-4 h-4 bg-primary rounded-full ml-auto" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                        <div>
                          <p className="font-medium">Require Biometric Match</p>
                          <p className="text-sm text-muted-foreground">Mandate facial verification for all documents</p>
                        </div>
                        <div className="w-10 h-6 bg-muted rounded-full flex items-center px-1">
                          <div className="w-4 h-4 bg-muted-foreground rounded-full" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                        <div>
                          <p className="font-medium">Send Alerts on Fraud Detection</p>
                          <p className="text-sm text-muted-foreground">Email notifications for flagged documents</p>
                        </div>
                        <div className="w-10 h-6 bg-primary/20 rounded-full flex items-center px-1">
                          <div className="w-4 h-4 bg-primary rounded-full ml-auto" />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-border">
                    <h3 className="text-lg font-semibold mb-4">API Configuration</h3>
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">Backend API Endpoint</p>
                      <code className="text-sm font-mono text-primary">https://uhakikiai.onrender.com</code>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
