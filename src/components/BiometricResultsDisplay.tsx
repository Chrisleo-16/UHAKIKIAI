import { motion } from 'framer-motion';
import { UserCheck, UserX, AlertTriangle, CheckCircle, XCircle, Eye, Sun, Layers, Fingerprint } from 'lucide-react';
import { BiometricVerificationResult } from '@/hooks/useBiometricVerification';
import { Badge } from '@/components/ui/badge';

interface BiometricResultsDisplayProps {
  result: BiometricVerificationResult;
}

export function BiometricResultsDisplay({ result }: BiometricResultsDisplayProps) {
  const verdictConfig = {
    MATCH: { color: 'text-success', bg: 'bg-success/10', border: 'border-success', icon: UserCheck, label: 'VERIFIED MATCH' },
    PARTIAL_MATCH: { color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning', icon: AlertTriangle, label: 'PARTIAL MATCH' },
    NO_MATCH: { color: 'text-danger', bg: 'bg-danger/10', border: 'border-danger', icon: UserX, label: 'NO MATCH' },
    INCONCLUSIVE: { color: 'text-muted-foreground', bg: 'bg-muted/50', border: 'border-border', icon: AlertTriangle, label: 'INCONCLUSIVE' },
  };

  const config = verdictConfig[result.matchVerdict];
  const VerdictIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Match Score & Verdict */}
      <div className={`p-4 rounded-lg border-2 ${config.bg} ${config.border}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <VerdictIcon className={`w-8 h-8 ${config.color}`} />
            <div>
              <p className={`font-bold text-lg ${config.color}`}>{config.label}</p>
              <p className="text-xs text-muted-foreground">Facial Recognition Result</p>
            </div>
          </div>
          <div className="text-right">
            <span className={`text-3xl font-bold ${config.color}`}>{result.matchScore}%</span>
            <p className="text-xs text-muted-foreground">Match Score</p>
          </div>
        </div>
      </div>

      {/* Liveness Score */}
      <div className="p-4 glass-card">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Fingerprint className="w-4 h-4 text-primary" />
            Liveness Detection
          </h4>
          <Badge variant={result.livenessConfidence >= 80 ? 'default' : result.livenessConfidence >= 50 ? 'secondary' : 'destructive'}>
            {result.livenessConfidence}%
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <LivenessIndicator 
            icon={<Sun className="w-4 h-4" />}
            label="Natural Lighting" 
            passed={result.livenessIndicators.naturalLighting} 
          />
          <LivenessIndicator 
            icon={<Layers className="w-4 h-4" />}
            label="Depth Cues" 
            passed={result.livenessIndicators.depthCues} 
          />
          <LivenessIndicator 
            icon={<Fingerprint className="w-4 h-4" />}
            label="Skin Texture" 
            passed={result.livenessIndicators.skinTexture} 
          />
          <LivenessIndicator 
            icon={<Eye className="w-4 h-4" />}
            label="Eye Reflection" 
            passed={result.livenessIndicators.eyeReflection} 
          />
        </div>
      </div>

      {/* Matching Features */}
      {result.matchingFeatures.length > 0 && (
        <div className="glass-card p-4">
          <h4 className="text-sm font-semibold text-success mb-2 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Matching Features
          </h4>
          <div className="flex flex-wrap gap-2">
            {result.matchingFeatures.map((feature, idx) => (
              <Badge key={idx} variant="outline" className="bg-success/10 text-success border-success/30">
                {feature}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Differing Features */}
      {result.differingFeatures.length > 0 && (
        <div className="glass-card p-4">
          <h4 className="text-sm font-semibold text-warning mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Differing Features
          </h4>
          <div className="flex flex-wrap gap-2">
            {result.differingFeatures.map((feature, idx) => (
              <Badge key={idx} variant="outline" className="bg-warning/10 text-warning border-warning/30">
                {feature}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Concerns */}
      {result.concerns.length > 0 && (
        <div className="p-3 bg-danger/10 border border-danger/30 rounded-lg">
          <h4 className="text-sm font-semibold text-danger mb-2 flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            Concerns
          </h4>
          <ul className="space-y-1">
            {result.concerns.map((concern, idx) => (
              <li key={idx} className="text-sm text-danger/80 flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-danger rounded-full mt-1.5 shrink-0" />
                {concern}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendation */}
      <div className={`p-3 rounded-lg border ${
        result.recommendation === 'APPROVE' 
          ? 'bg-success/10 border-success text-success'
          : result.recommendation === 'MANUAL_REVIEW'
          ? 'bg-warning/10 border-warning text-warning'
          : 'bg-danger/10 border-danger text-danger'
      }`}>
        <p className="font-semibold text-center">
          Recommendation: {result.recommendation.replace('_', ' ')}
        </p>
      </div>
    </motion.div>
  );
}

function LivenessIndicator({ icon, label, passed }: { icon: React.ReactNode; label: string; passed: boolean }) {
  return (
    <div className={`flex items-center gap-2 p-2 rounded-lg ${passed ? 'bg-success/10' : 'bg-muted/30'}`}>
      <div className={passed ? 'text-success' : 'text-muted-foreground'}>{icon}</div>
      <span className={`text-xs ${passed ? 'text-success' : 'text-muted-foreground'}`}>{label}</span>
      {passed ? <CheckCircle className="w-3 h-3 text-success ml-auto" /> : <XCircle className="w-3 h-3 text-muted-foreground ml-auto" />}
    </div>
  );
}
