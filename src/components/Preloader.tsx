import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '@/assets/uhakiki-logo.svg';

interface PreloaderProps {
  onComplete: () => void;
}

export function Preloader({ onComplete }: PreloaderProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    // Simulate loading progress
    const progressInterval = setInterval(() => {
      setPercentage((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + Math.random() * 30;
      });
    }, 100);

    const timer = setTimeout(() => {
      setPercentage(100);
      clearInterval(progressInterval);
      setTimeout(() => {
        setIsVisible(false);
        setTimeout(onComplete, 500);
      }, 500);
    }, 3500);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            scale: 1.1,
            filter: "blur(20px)"
          }}
          transition={{ 
            duration: 0.8, 
            ease: [0.4, 0, 0.2, 1] 
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #0a0a0a 0%, #111 50%, #0a0a0a 100%)'
          }}
        >
          {/* Animated background grid */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0" 
              style={{
                backgroundImage: `
                  linear-gradient(to right, hsl(160 100% 50% / 0.1) 1px, transparent 1px),
                  linear-gradient(to bottom, hsl(160 100% 50% / 0.1) 1px, transparent 1px)
                `,
                backgroundSize: '50px 50px',
              }}
            />
          </div>

          {/* Glowing center orb with particles */}
          <div className="relative flex flex-col items-center justify-center gap-12">
            {/* Animated particles */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(30)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-[2px] h-[2px] rounded-full bg-primary"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    x: [0, (Math.random() - 0.5) * 100],
                    y: [0, (Math.random() - 0.5) * 100],
                    opacity: [0, 0.8, 0],
                    scale: [0, 1, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: i * 0.1,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>

            {/* Main glow container */}
            <div className="relative w-64 h-64">
              {/* Outer glow pulse */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'radial-gradient(circle at center, hsl(160 100% 60% / 0.3) 0%, transparent 70%)',
                }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />

              {/* Concentric rings */}
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-full border border-primary/30"
                  style={{
                    scale: 0.7 + i * 0.1,
                  }}
                  animate={{
                    scale: [0.7 + i * 0.1, 0.8 + i * 0.1, 0.7 + i * 0.1],
                    opacity: [0.1, 0.3, 0.1],
                    borderColor: [
                      'hsl(160 100% 50% / 0.2)',
                      'hsl(160 100% 50% / 0.5)',
                      'hsl(160 100% 50% / 0.2)',
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut"
                  }}
                />
              ))}

              {/* Rotating hexagon/tech pattern */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={{ rotate: 360 }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                <div className="relative w-48 h-48">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute top-1/2 left-1/2 w-16 h-[2px] bg-primary/20 origin-left"
                      style={{
                        transform: `translate(-50%, -50%) rotate(${i * 60}deg)`,
                      }}
                    />
                  ))}
                </div>
              </motion.div>

              {/* Central glow effect */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'radial-gradient(circle at center, hsl(160 100% 60% / 0.8) 0%, transparent 70%)',
                  filter: 'blur(20px)',
                }}
                animate={{
                  scale: [0.8, 1.2, 0.8],
                  opacity: [0.6, 0.9, 0.6],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />

              {/* Logo container with enhanced glow */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  className="relative z-20"
                  animate={{
                    scale: [1, 1.05, 1],
                    filter: [
                      'drop-shadow(0 0 20px hsl(160 100% 50% / 0.5))',
                      'drop-shadow(0 0 40px hsl(160 100% 50% / 0.8))',
                      'drop-shadow(0 0 20px hsl(160 100% 50% / 0.5))',
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  {/* White base logo for better glow effect */}
                  <div className="relative">
                    <motion.img
                      src={logo}
                      alt="UhakikiAI Logo"
                      className="w-32 h-32 object-contain relative z-10"
                      style={{
                        filter: 'brightness(1.5) contrast(1.2)'
                      }}
                    />
                    {/* Glow behind logo */}
                    <motion.div
                      className="absolute inset-0 w-32 h-32 blur-xl"
                      style={{
                        background: 'radial-gradient(circle at center, hsl(160 100% 50% / 0.6) 0%, transparent 70%)',
                      }}
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 0.8, 0.5],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  </div>
                </motion.div>
              </div>

              {/* Scanning lines effect */}
              <motion.div
                className="absolute inset-0 rounded-full overflow-hidden"
                style={{
                  maskImage: 'radial-gradient(circle, white 50%, transparent 70%)',
                }}
              >
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-full h-[1px] bg-primary/40"
                    style={{
                      top: `${(i + 1) * 25}%`,
                    }}
                    animate={{
                      y: ['-100%', '200%'],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.5,
                      ease: "linear"
                    }}
                  />
                ))}
              </motion.div>
            </div>

            {/* Progress indicator */}
            <div className="relative w-64">
              {/* Loading text */}
              <motion.div
                className="mb-4 text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <span className="text-primary font-bold text-lg tracking-[0.2em] uppercase">
                  Initializing System
                </span>
                <motion.span
                  className="ml-2 text-primary/70"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  {Math.round(percentage)}%
                </motion.span>
              </motion.div>

              {/* Progress bar */}
              <div className="relative h-1 bg-primary/10 rounded-full overflow-hidden">
                <motion.div
                  className="absolute top-0 left-0 h-full rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, hsl(160 100% 50% / 0.3), hsl(160 100% 50%)',
                    width: `${percentage}%`,
                  }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
                
                {/* Progress bar glow */}
                <motion.div
                  className="absolute top-0 left-0 h-full w-8 blur-md"
                  style={{
                    background: 'hsl(160 100% 50%)',
                    left: `${percentage - 4}%`,
                  }}
                  animate={{
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </div>

              {/* Loading dots */}
              <div className="flex justify-center gap-2 mt-6">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-primary/50"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.3, 1, 0.3],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>

              {/* Status text */}
              <motion.div
                className="mt-4 text-center text-sm text-primary/60"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <motion.span
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Secure Identity Verification
                </motion.span>
              </motion.div>
            </div>

            {/* Tech pattern at bottom */}
            <div className="absolute -bottom-12 w-full">
              <div className="flex justify-between items-center px-8">
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-8 h-[1px] bg-primary/30"
                    animate={{
                      width: ['0%', '100%', '0%'],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.3,
                      ease: "easeInOut"
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Version/System info - subtle but professional */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <span className="text-xs text-primary/30 tracking-widest">
              UHAKIKI AI v1.0 • SECURE BOOT
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}