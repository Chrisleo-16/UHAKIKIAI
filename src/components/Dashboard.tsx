import { useState, useCallback } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { ForensicScanner } from './ForensicScanner';
import { DecisionPanel } from './DecisionPanel';
import { OCRResult } from '@/types/ocr';

export function Dashboard() {
  const [activeTab, setActiveTab] = useState('scan');
  const [showResults, setShowResults] = useState(false);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);

  const handleScanComplete = useCallback((result: OCRResult | null) => {
    setShowResults(true);
    setOcrResult(result);
  }, []);

  const handleReset = useCallback(() => {
    setShowResults(false);
    setOcrResult(null);
  }, []);

  return (
    <div className="flex h-screen w-full bg-background cyber-grid overflow-hidden">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <TopBar />

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {activeTab === 'scan' && (
            <>
              <ForensicScanner onScanComplete={handleScanComplete} onReset={handleReset} />
              <DecisionPanel showResults={showResults} ocrResult={ocrResult} />
            </>
          )}

          {activeTab === 'dashboard' && (
            <div className="flex-1 p-6 flex items-center justify-center">
              <div className="glass-card p-12 text-center max-w-md">
                <h2 className="text-2xl font-bold text-foreground mb-2">Dashboard</h2>
                <p className="text-muted-foreground">
                  Analytics and statistics module coming soon. Track verification metrics, fraud detection rates, and system performance.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'cases' && (
            <div className="flex-1 p-6 flex items-center justify-center">
              <div className="glass-card p-12 text-center max-w-md">
                <h2 className="text-2xl font-bold text-foreground mb-2">Case Files</h2>
                <p className="text-muted-foreground">
                  Access historical verification records, flagged documents, and investigation reports.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="flex-1 p-6 flex items-center justify-center">
              <div className="glass-card p-12 text-center max-w-md">
                <h2 className="text-2xl font-bold text-foreground mb-2">Settings</h2>
                <p className="text-muted-foreground">
                  Configure system preferences, detection thresholds, and integration endpoints.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
