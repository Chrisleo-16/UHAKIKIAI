import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '@/assets/uhakiki-logo.svg';

interface PreloaderProps {
  onComplete: () => void;
}

export function Preloader({ onComplete }: PreloaderProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 800);
    }, 5200);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background cyber-grid overflow-hidden"
        >
          {/* Background glow effects */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
              style={{
                background: 'radial-gradient(circle, hsl(160 100% 50% / 0.15) 0%, transparent 70%)',
              }}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </div>

          {/* Main preloader container */}
          <div className="relative flex flex-col items-center justify-center">
            {/* Spinning text wrapper */}
            <motion.div
              className="absolute w-[320px] h-[320px]"
              animate={{ rotate: 360 }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'linear',
              }}
            >
              <svg viewBox="0 0 320 320" className="w-full h-full">
                <defs>
                  <path
                    id="textCircle"
                    d="M 160, 160 m -140, 0 a 140,140 0 1,1 280,0 a 140,140 0 1,1 -280,0"
                    fill="none"
                  />
                </defs>
                <text className="fill-primary font-mono text-sm tracking-[0.4em] uppercase">
                  <textPath href="#textCircle" startOffset="0%">
                    UhakikiAI • Identity Verification • UhakikiAI • Identity Verification •
                  </textPath>
                </text>
              </svg>
            </motion.div>

            {/* Logo container with light beam effect */}
            <div className="relative w-48 h-48 flex items-center justify-center">
              {/* Light beam rays emanating from center */}
              <div className="absolute inset-0 flex items-center justify-center">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 origin-center"
                    style={{
                      height: '140px',
                      rotate: `${i * 30}deg`,
                      background: 'linear-gradient(to top, hsl(160 100% 50% / 0.8), hsl(160 100% 50% / 0.2), transparent)',
                    }}
                    initial={{ scaleY: 0, opacity: 0 }}
                    animate={{
                      scaleY: [0, 1, 1, 0],
                      opacity: [0, 0.9, 0.9, 0],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      delay: i * 0.15,
                      ease: 'easeOut',
                    }}
                  />
                ))}
              </div>

              {/* Inner glow pulse */}
              <motion.div
                className="absolute w-32 h-32 rounded-full"
                style={{
                  background: 'radial-gradient(circle, hsl(160 100% 50% / 0.4) 0%, transparent 70%)',
                }}
                animate={{
                  scale: [0.8, 1.2, 0.8],
                  opacity: [0.3, 0.7, 0.3],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />

              {/* Light pipe effect - concentric rings */}
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full border-2"
                  style={{
                    width: `${60 + i * 25}px`,
                    height: `${60 + i * 25}px`,
                    borderColor: 'hsl(160 100% 50% / 0.3)',
                  }}
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.2, 0.6, 0.2],
                    borderColor: [
                      'hsl(160 100% 50% / 0.2)',
                      'hsl(160 100% 50% / 0.8)',
                      'hsl(160 100% 50% / 0.2)',
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.3,
                    ease: 'easeInOut',
                  }}
                />
              ))}

              {/* Logo */}
              <motion.div
                className="relative z-10"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              >
                <motion.img
                  src={logo}
                  alt="UhakikiAI Logo"
                  className="w-24 h-24 object-contain drop-shadow-[0_0_20px_rgba(0,255,163,0.5)]"
                  animate={{
                    filter: [
                      'drop-shadow(0 0 20px rgba(0,255,163,0.5))',
                      'drop-shadow(0 0 40px rgba(0,255,163,0.8))',
                      'drop-shadow(0 0 20px rgba(0,255,163,0.5))',
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              </motion.div>
            </div>

            {/* Loading text */}
            <motion.div
              className="mt-12 flex flex-col items-center gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <span className="text-primary font-bold text-xl tracking-wider">
                INITIALIZING SYSTEM
              </span>
              <div className="flex gap-1">
                {[0, 1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-primary rounded-full"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.3, 1, 0.3],
                    }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      delay: i * 0.15,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
