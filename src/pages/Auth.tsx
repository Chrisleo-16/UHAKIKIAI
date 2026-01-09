import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Loader2, AlertCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/useAuth';
import { z } from 'zod';
import uhakikiLogo from '@/assets/uhakiki-logo.svg';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');
const nameSchema = z.string().min(2, 'Name must be at least 2 characters');

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ email?: string; password?: string; name?: string }>({});
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  const { user, loading, signIn, signUp } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const validateForm = () => {
    const errors: { email?: string; password?: string; name?: string } = {};
    
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      errors.email = emailResult.error.errors[0].message;
    }
    
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      errors.password = passwordResult.error.errors[0].message;
    }
    
    if (!isLogin) {
      const nameResult = nameSchema.safeParse(fullName);
      if (!nameResult.success) {
        errors.name = nameResult.error.errors[0].message;
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) return;
    
    if (!isLogin && !agreedToTerms) {
      setError('Please agree to the Terms & Conditions');
      return;
    }
    
    setIsSubmitting(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            setError('Invalid email or password. Please try again.');
          } else {
            setError(error.message);
          }
        }
      } else {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          if (error.message.includes('already registered')) {
            setError('An account with this email already exists. Please sign in instead.');
          } else {
            setError(error.message);
          }
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background relative overflow-hidden">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-purple-900/40 via-purple-800/20 to-transparent blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-primary/10 via-primary/5 to-transparent blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-gradient-to-bl from-purple-700/20 to-transparent blur-2xl animate-pulse" />
      </div>

      {/* Left Panel - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24 py-12 relative z-10">
        {/* Logo */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3">
            <img src={uhakikiLogo} alt="UhakikiAI" className="w-10 h-10" />
            <span className="text-xl font-bold text-foreground">UhakikiAI</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-md"
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {isLogin ? 'Welcome Back' : 'Create Your Account'}
          </h1>
          <p className="text-muted-foreground mb-8">
            {isLogin ? 'Sign in to access your verification dashboard' : 'Start verifying documents with AI-powered forensics'}
          </p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/30 flex items-center gap-3 text-destructive"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm text-muted-foreground">Full Name</Label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center">
                    <User className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-14 h-14 bg-muted/30 border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:border-primary/50"
                    disabled={isSubmitting}
                  />
                </div>
                {validationErrors.name && (
                  <p className="text-xs text-destructive">{validationErrors.name}</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm text-muted-foreground">Email Address</Label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-14 h-14 bg-muted/30 border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:border-primary/50"
                  disabled={isSubmitting}
                />
              </div>
              {validationErrors.email && (
                <p className="text-xs text-destructive">{validationErrors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm text-muted-foreground">Password</Label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-14 h-14 bg-muted/30 border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:border-primary/50"
                  disabled={isSubmitting}
                />
              </div>
              {validationErrors.password && (
                <p className="text-xs text-destructive">{validationErrors.password}</p>
              )}
            </div>

            {!isLogin && (
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Checkbox 
                    id="terms" 
                    checked={agreedToTerms}
                    onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                    className="mt-1 border-muted-foreground/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                    I agree to the <span className="text-foreground hover:text-primary cursor-pointer">Terms & Conditions</span> and <span className="text-foreground hover:text-primary cursor-pointer">Privacy Policy</span>.
                  </label>
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-14 rounded-xl bg-foreground hover:bg-foreground/90 text-background font-semibold text-base mt-6"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isLogin ? (
                'Sign in'
              ) : (
                'Sign up'
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <span className="text-muted-foreground text-sm">
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
            </span>
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setValidationErrors({});
              }}
              className="text-sm text-primary hover:underline font-medium"
              disabled={isSubmitting}
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-auto pt-12 flex items-center justify-between text-xs text-muted-foreground"
        >
          <span>Copyright © 2024 UhakikiAI</span>
          <div className="flex gap-4">
            <span className="hover:text-foreground cursor-pointer">Terms and conditions</span>
            <span className="hover:text-foreground cursor-pointer">Privacy policy</span>
          </div>
        </motion.div>
      </div>

      {/* Right Panel - Illustration */}
      <div className="hidden lg:flex w-1/2 items-center justify-center relative z-10 p-12">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="relative"
        >
          {/* Floating Badge */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="absolute -top-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full bg-muted/50 backdrop-blur-xl border border-border/50 flex items-center gap-2"
          >
            <span className="text-xl">🔒</span>
            <span className="text-foreground font-medium">Verify Documents</span>
            <span className="text-primary font-bold">Smarter</span>
            <span className="text-xl">✨</span>
          </motion.div>

          {/* Phone Mockup */}
          <div className="relative w-[320px] h-[640px] bg-gradient-to-b from-muted/80 to-muted/40 rounded-[3rem] border-4 border-muted/50 shadow-2xl overflow-hidden backdrop-blur-xl">
            {/* Phone Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-background rounded-b-2xl" />
            
            {/* Phone Screen Content */}
            <div className="absolute inset-4 top-8 bg-gradient-to-b from-background/90 to-background/70 rounded-[2.5rem] overflow-hidden">
              {/* Status Bar */}
              <div className="flex items-center justify-between px-6 py-3 text-xs text-muted-foreground">
                <span>9:41</span>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-2 border border-muted-foreground rounded-sm">
                    <div className="w-3/4 h-full bg-primary rounded-sm" />
                  </div>
                </div>
              </div>

              {/* App Header */}
              <div className="px-6 py-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-lg font-semibold text-foreground">Hey, Officer</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <span>📍</span>
                      <span>Nairobi, Kenya</span>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center">
                    <span className="text-lg">🔔</span>
                  </div>
                </div>
              </div>

              {/* Feature Cards */}
              <div className="px-6 space-y-3">
                <p className="text-sm font-medium text-foreground mb-2">Recent Verifications</p>
                
                <motion.div 
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="p-3 rounded-xl bg-gradient-to-r from-primary/20 to-primary/5 border border-primary/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Check className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">KCSE Certificate</p>
                      <p className="text-xs text-muted-foreground">Verified • 2 mins ago</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="p-3 rounded-xl bg-muted/30 border border-border/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-warning" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">University Degree</p>
                      <p className="text-xs text-muted-foreground">Flagged • 15 mins ago</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="p-3 rounded-xl bg-muted/30 border border-border/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Check className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">National ID</p>
                      <p className="text-xs text-muted-foreground">Verified • 1 hour ago</p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Bottom Nav */}
              <div className="absolute bottom-4 left-4 right-4 flex justify-around py-3 bg-muted/30 rounded-2xl backdrop-blur-sm">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-[10px] text-primary">Home</span>
                </div>
                <div className="flex flex-col items-center gap-1 opacity-50">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">Scan</span>
                </div>
                <div className="flex flex-col items-center gap-1 opacity-50">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">History</span>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-gradient-to-br from-purple-600/30 to-transparent blur-2xl" />
          <div className="absolute -top-10 -left-10 w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-2xl" />
        </motion.div>
      </div>
    </div>
  );
}
