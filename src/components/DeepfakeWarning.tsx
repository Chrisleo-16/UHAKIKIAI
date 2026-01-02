import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Shield, Eye, Scan, XCircle, CheckCircle2, Info } from 'lucide-react';

interface DeepfakeAnalysis {
  isLikelyDeepfake: boolean;
  confidence: number;
  indicators: {
    name: string;
    detected: boolean;
    severity: 'low' | 'medium' | 'high';
    description: string;
  }[];
  recommendation: 'safe' | 'review' | 'reject';
}

interface DeepfakeWarningProps {
  livenessScore: number;
  livenessIndicators?: {
    naturalLighting?: boolean;
    depthCues?: boolean;
    skinTexture?: boolean;
    eyeReflection?: boolean;
  };
  matchScore?: number;
  concerns?: string[];
}

function analyzeDeepfakeRisk(props: DeepfakeWarningProps): DeepfakeAnalysis {
  const { livenessScore, livenessIndicators, matchScore, concerns } = props;
  const indicators: DeepfakeAnalysis['indicators'] = [];
  
  // Analyze liveness indicators
  if (livenessIndicators) {
    if (!livenessIndicators.naturalLighting) {
      indicators.push({
        name: 'Unnatural Lighting',
        detected: true,
        severity: 'medium',
        description: 'Lighting patterns inconsistent with natural environment'
      });
    }
    
    if (!livenessIndicators.depthCues) {
      indicators.push({
        name: 'Missing Depth Cues',
        detected: true,
        severity: 'high',
        description: 'Face appears flat, lacking 3D depth information'
      });
    }
    
    if (!livenessIndicators.skinTexture) {
      indicators.push({
        name: 'Artificial Skin Texture',
        detected: true,
        severity: 'high',
        description: 'Skin texture appears synthetic or overly smooth'
      });
    }
    
    if (!livenessIndicators.eyeReflection) {
      indicators.push({
        name: 'Eye Reflection Anomaly',
        detected: true,
        severity: 'medium',
        description: 'Eye reflections missing or inconsistent'
      });
    }
  }
  
  // Low liveness score is a major indicator
  if (livenessScore < 60) {
    indicators.push({
      name: 'Low Liveness Score',
      detected: true,
      severity: 'high',
      description: 'Face does not appear to be from a live person'
    });
  } else if (livenessScore < 75) {
    indicators.push({
      name: 'Moderate Liveness Concern',
      detected: true,
      severity: 'medium',
      description: 'Some liveness checks did not pass confidently'
    });
  }
  
  // Analyze concerns from biometric verification
  if (concerns && concerns.length > 0) {
    concerns.forEach(concern => {
      const lowerConcern = concern.toLowerCase();
      if (lowerConcern.includes('deepfake') || lowerConcern.includes('synthetic')) {
        indicators.push({
          name: 'AI Detection Alert',
          detected: true,
          severity: 'high',
          description: concern
        });
      } else if (lowerConcern.includes('quality') || lowerConcern.includes('blur')) {
        indicators.push({
          name: 'Image Quality Issue',
          detected: true,
          severity: 'low',
          description: concern
        });
      }
    });
  }
  
  // Calculate overall deepfake probability
  const highSeverityCount = indicators.filter(i => i.severity === 'high').length;
  const mediumSeverityCount = indicators.filter(i => i.severity === 'medium').length;
  
  const deepfakeConfidence = Math.min(100, highSeverityCount * 30 + mediumSeverityCount * 15 + (100 - livenessScore));
  const isLikelyDeepfake = deepfakeConfidence > 50;
  
  let recommendation: 'safe' | 'review' | 'reject' = 'safe';
  if (deepfakeConfidence > 70) recommendation = 'reject';
  else if (deepfakeConfidence > 40) recommendation = 'review';
  
  return {
    isLikelyDeepfake,
    confidence: deepfakeConfidence,
    indicators,
    recommendation
  };
}

export function DeepfakeWarning({ 
  livenessScore, 
  livenessIndicators, 
  matchScore, 
  concerns 
}: DeepfakeWarningProps) {
  const analysis = analyzeDeepfakeRisk({ livenessScore, livenessIndicators, matchScore, concerns });
  
  if (analysis.indicators.length === 0 && analysis.recommendation === 'safe') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-4 border border-success/30 bg-success/5"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-success" />
          </div>
          <div>
            <h4 className="font-semibold text-success">Liveness Verified</h4>
            <p className="text-sm text-muted-foreground">No deepfake indicators detected</p>
          </div>
        </div>
      </motion.div>
    );
  }
  
  const borderColor = analysis.recommendation === 'reject' 
    ? 'border-danger/50' 
    : analysis.recommendation === 'review' 
    ? 'border-warning/50' 
    : 'border-success/30';
    
  const bgColor = analysis.recommendation === 'reject' 
    ? 'bg-danger/5' 
    : analysis.recommendation === 'review' 
    ? 'bg-warning/5' 
    : 'bg-success/5';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-card p-4 border ${borderColor} ${bgColor}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className={`w-5 h-5 ${
            analysis.recommendation === 'reject' ? 'text-danger' : 'text-warning'
          }`} />
          <h4 className="font-semibold text-foreground">Deepfake Analysis</h4>
        </div>
        <div className={`px-2 py-1 rounded text-xs font-medium ${
          analysis.recommendation === 'reject' 
            ? 'bg-danger/20 text-danger' 
            : analysis.recommendation === 'review'
            ? 'bg-warning/20 text-warning'
            : 'bg-success/20 text-success'
        }`}>
          {analysis.recommendation === 'reject' ? 'HIGH RISK' : 
           analysis.recommendation === 'review' ? 'NEEDS REVIEW' : 'LOW RISK'}
        </div>
      </div>
      
      {/* Risk Meter */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>Deepfake Probability</span>
          <span className={analysis.confidence > 50 ? 'text-danger' : 'text-warning'}>
            {analysis.confidence.toFixed(0)}%
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${analysis.confidence}%` }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`h-full ${
              analysis.confidence > 70 ? 'bg-danger' : 
              analysis.confidence > 40 ? 'bg-warning' : 'bg-success'
            }`}
          />
        </div>
      </div>
      
      {/* Indicators */}
      <AnimatePresence>
        {analysis.indicators.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-2"
          >
            <p className="text-xs text-muted-foreground mb-2">DETECTED INDICATORS</p>
            {analysis.indicators.map((indicator, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-start gap-2 p-2 rounded bg-background/50"
              >
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                  indicator.severity === 'high' ? 'bg-danger' :
                  indicator.severity === 'medium' ? 'bg-warning' : 'bg-primary'
                }`} />
                <div>
                  <p className="text-sm font-medium text-foreground">{indicator.name}</p>
                  <p className="text-xs text-muted-foreground">{indicator.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Recommendation */}
      {analysis.recommendation !== 'safe' && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2 text-sm">
            <Info className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">
              {analysis.recommendation === 'reject' 
                ? 'This submission shows strong signs of manipulation. Manual verification strongly recommended before proceeding.'
                : 'Some indicators suggest potential manipulation. Additional verification may be needed.'}
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
