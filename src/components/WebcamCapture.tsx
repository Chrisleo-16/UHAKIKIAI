import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Video, VideoOff, RefreshCw, Check, AlertTriangle, User, Eye, Smile, MoveHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export interface BiometricResult {
  capturedImage: string;
  livenessScore: number;
  livenessChecks: {
    faceDetected: boolean;
    blinkDetected: boolean;
    headMovement: boolean;
    expressionChange: boolean;
  };
  passed: boolean;
}

interface WebcamCaptureProps {
  onCapture: (result: BiometricResult) => void;
  onReset: () => void;
  isVerifying?: boolean;
}

type LivenessStep = 'idle' | 'detecting' | 'blink' | 'turn' | 'smile' | 'capturing' | 'complete';

const livenessInstructions: Record<LivenessStep, { icon: React.ReactNode; text: string }> = {
  idle: { icon: <Camera className="w-8 h-8" />, text: 'Click "Start Verification" to begin' },
  detecting: { icon: <User className="w-8 h-8" />, text: 'Position your face in the frame...' },
  blink: { icon: <Eye className="w-8 h-8" />, text: 'Please blink your eyes slowly' },
  turn: { icon: <MoveHorizontal className="w-8 h-8" />, text: 'Turn your head slightly left, then right' },
  smile: { icon: <Smile className="w-8 h-8" />, text: 'Now give a natural smile' },
  capturing: { icon: <Camera className="w-8 h-8" />, text: 'Hold still... Capturing...' },
  complete: { icon: <Check className="w-8 h-8" />, text: 'Liveness verification complete!' },
};

export function WebcamCapture({ onCapture, onReset, isVerifying }: WebcamCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [isStreaming, setIsStreaming] = useState(false);
  const [livenessStep, setLivenessStep] = useState<LivenessStep>('idle');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [livenessChecks, setLivenessChecks] = useState({
    faceDetected: false,
    blinkDetected: false,
    headMovement: false,
    expressionChange: false,
  });

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
        toast.success('Camera activated');
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Failed to access camera. Please check permissions.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  }, []);

  const startLivenessCheck = useCallback(async () => {
    if (!isStreaming) {
      await startCamera();
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setLivenessChecks({
      faceDetected: false,
      blinkDetected: false,
      headMovement: false,
      expressionChange: false,
    });
    setCapturedImage(null);
    
    // Simulate liveness detection sequence
    setLivenessStep('detecting');
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLivenessChecks(prev => ({ ...prev, faceDetected: true }));
    
    setLivenessStep('blink');
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLivenessChecks(prev => ({ ...prev, blinkDetected: true }));
    
    setLivenessStep('turn');
    await new Promise(resolve => setTimeout(resolve, 2500));
    setLivenessChecks(prev => ({ ...prev, headMovement: true }));
    
    setLivenessStep('smile');
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLivenessChecks(prev => ({ ...prev, expressionChange: true }));
    
    setLivenessStep('capturing');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Capture the image
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageData);
        
        const livenessScore = 0.85 + Math.random() * 0.1; // 85-95%
        
        const result: BiometricResult = {
          capturedImage: imageData,
          livenessScore,
          livenessChecks: {
            faceDetected: true,
            blinkDetected: true,
            headMovement: true,
            expressionChange: true,
          },
          passed: livenessScore >= 0.7,
        };
        
        setLivenessStep('complete');
        onCapture(result);
        
        toast.success('Biometric verification captured', {
          icon: <Check className="w-5 h-5 text-success" />,
        });
      }
    }
  }, [isStreaming, startCamera, onCapture]);

  const handleReset = useCallback(() => {
    setCapturedImage(null);
    setLivenessStep('idle');
    setLivenessChecks({
      faceDetected: false,
      blinkDetected: false,
      headMovement: false,
      expressionChange: false,
    });
    onReset();
  }, [onReset]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const isProcessing = ['detecting', 'blink', 'turn', 'smile', 'capturing'].includes(livenessStep);

  return (
    <div className="space-y-4">
      {/* Video/Capture Display */}
      <div className="relative aspect-video bg-muted rounded-lg overflow-hidden border border-border">
        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />
        
        {capturedImage ? (
          <img 
            src={capturedImage} 
            alt="Captured biometric" 
            className="w-full h-full object-cover"
          />
        ) : isStreaming ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover mirror"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <Camera className="w-16 h-16 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">Camera Feed</p>
            <p className="text-xs text-muted-foreground">Click below to activate</p>
          </div>
        )}

        {/* Face detection overlay */}
        <AnimatePresence>
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {/* Face guide oval */}
              <motion.div
                animate={{ 
                  scale: [1, 1.02, 1],
                  borderColor: livenessChecks.faceDetected ? 'hsl(var(--success))' : 'hsl(var(--primary))'
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-32 h-44 border-4 border-primary rounded-[50%] shadow-lg"
                style={{ 
                  boxShadow: `0 0 20px ${livenessChecks.faceDetected ? 'hsl(var(--success) / 0.5)' : 'hsl(var(--primary) / 0.5)'}`
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scanning line animation */}
        {isProcessing && (
          <motion.div
            animate={{ y: ['0%', '100%', '0%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent"
          />
        )}

        {/* Status indicator */}
        {isStreaming && (
          <div className="absolute top-3 left-3 flex items-center gap-2 px-2 py-1 bg-black/50 rounded-full">
            <span className="w-2 h-2 bg-danger rounded-full animate-pulse" />
            <span className="text-xs text-white">LIVE</span>
          </div>
        )}
      </div>

      {/* Liveness Instructions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={livenessStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`flex items-center gap-3 p-4 rounded-lg border ${
            livenessStep === 'complete' 
              ? 'bg-success/10 border-success text-success' 
              : 'bg-muted/50 border-border text-foreground'
          }`}
        >
          <div className={livenessStep === 'complete' ? 'text-success' : 'text-primary'}>
            {livenessInstructions[livenessStep].icon}
          </div>
          <div className="flex-1">
            <p className="font-medium">{livenessInstructions[livenessStep].text}</p>
            {isProcessing && (
              <p className="text-xs text-muted-foreground mt-1">Follow the instructions for biometric verification</p>
            )}
          </div>
          {isProcessing && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <RefreshCw className="w-5 h-5 text-primary" />
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Liveness Check Progress */}
      <div className="grid grid-cols-4 gap-2">
        <LivenessCheckItem 
          label="Face" 
          checked={livenessChecks.faceDetected} 
          active={livenessStep === 'detecting'}
        />
        <LivenessCheckItem 
          label="Blink" 
          checked={livenessChecks.blinkDetected} 
          active={livenessStep === 'blink'}
        />
        <LivenessCheckItem 
          label="Movement" 
          checked={livenessChecks.headMovement} 
          active={livenessStep === 'turn'}
        />
        <LivenessCheckItem 
          label="Expression" 
          checked={livenessChecks.expressionChange} 
          active={livenessStep === 'smile'}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        {!isStreaming && livenessStep === 'idle' && (
          <Button onClick={startCamera} variant="outline" className="flex-1">
            <Video className="w-4 h-4 mr-2" />
            Enable Camera
          </Button>
        )}
        
        {isStreaming && livenessStep === 'idle' && (
          <>
            <Button onClick={stopCamera} variant="outline" size="icon">
              <VideoOff className="w-4 h-4" />
            </Button>
            <Button 
              onClick={startLivenessCheck} 
              className="flex-1 bg-primary hover:bg-primary/90"
              disabled={isVerifying}
            >
              <User className="w-4 h-4 mr-2" />
              Start Verification
            </Button>
          </>
        )}

        {livenessStep === 'complete' && (
          <Button onClick={handleReset} variant="outline" className="flex-1">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retake Capture
          </Button>
        )}
      </div>
    </div>
  );
}

function LivenessCheckItem({ label, checked, active }: { label: string; checked: boolean; active: boolean }) {
  return (
    <div 
      className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all ${
        checked 
          ? 'bg-success/10 border-success' 
          : active 
          ? 'bg-primary/10 border-primary animate-pulse' 
          : 'bg-muted/30 border-border'
      }`}
    >
      {checked ? (
        <Check className="w-4 h-4 text-success" />
      ) : (
        <div className={`w-4 h-4 rounded-full border-2 ${active ? 'border-primary' : 'border-muted-foreground'}`} />
      )}
      <span className={`text-xs ${checked ? 'text-success' : active ? 'text-primary' : 'text-muted-foreground'}`}>
        {label}
      </span>
    </div>
  );
}
