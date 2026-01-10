import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Zap, 
  Globe, 
  CheckCircle, 
  ArrowRight,
  FileCheck,
  Brain,
  Lock,
  Users,
  TrendingUp,
  Award,
  ChevronRight,
  Play,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CodeCarousel } from '@/components/CodeCarousel';
import uhakikiLogo from '@/assets/uhakiki-logo.svg';

const features = [
  {
    icon: FileCheck,
    title: 'Document Verification',
    description: 'AI-powered verification of academic certificates, IDs, and official documents with 99.7% accuracy.'
  },
  {
    icon: Brain,
    title: 'Fraud Detection',
    description: 'Advanced forensic analysis detects synthetic documents, tampering, and generative AI forgeries.'
  },
  {
    icon: Shield,
    title: 'Biometric Matching',
    description: 'Facial recognition and liveness detection ensure the person matches their documents.'
  },
  {
    icon: Zap,
    title: 'Real-time API',
    description: 'Lightning-fast verification via RESTful API. Integrate in minutes with any platform.'
  },
  {
    icon: Globe,
    title: 'Pan-African Coverage',
    description: 'Built for African institutions with support for local document formats and registries.'
  },
  {
    icon: Lock,
    title: 'Enterprise Security',
    description: 'Bank-grade encryption, SOC2 compliance, and complete audit trails for every verification.'
  }
];

const stats = [
  { value: '2M+', label: 'Documents Verified' },
  { value: '99.7%', label: 'Accuracy Rate' },
  { value: '<2s', label: 'Avg Response Time' },
  { value: '150+', label: 'Institutions Trust Us' }
];

const partners = [
  'KNEC', 'eCitizen', 'HELB', 'KUCCPS', 'TSC', 'IEBC', 'NTSA'
];

const testimonials = [
  {
    quote: "UhakikiAI has revolutionized our hiring process. We now verify candidate credentials in seconds instead of weeks.",
    author: "David Mwangi",
    role: "HR Director",
    company: "Safaricom PLC"
  },
  {
    quote: "The API integration was seamless. Our student verification portal now catches fraudulent documents we would have missed.",
    author: "Prof. Jane Wambui",
    role: "Registrar",
    company: "University of Nairobi"
  },
  {
    quote: "Finally, a verification solution built for African documents. The accuracy on KCSE certificates is remarkable.",
    author: "Brian Odhiambo",
    role: "CTO",
    company: "Equity Bank"
  }
];

export function LandingPage() {
  const navigate = useNavigate();
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={uhakikiLogo} alt="UhakikiAI" className="h-8 w-auto" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              UhakikiAI
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#api" className="text-sm text-muted-foreground hover:text-foreground transition-colors">API</a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            <a href="https://uhakikiai.onrender.com/api/v1/docs" target="_blank" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Documentation</a>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate('/auth')}>
              Sign In
            </Button>
            <Button onClick={() => navigate('/auth')} className="bg-primary hover:bg-primary/90">
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl opacity-30" />
        
        <div className="max-w-7xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 px-4 py-1.5">
              🚀 Now Live on Render Cloud
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              The <span className="bg-gradient-to-r from-primary via-emerald-400 to-primary bg-clip-text text-transparent">Trust Layer</span> for African Credentials
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              UhakikiAI empowers institutions worldwide with AI-powered document verification, 
              fraud detection, and biometric matching. Verify credentials in seconds, not weeks.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Button 
                size="lg" 
                onClick={() => navigate('/auth')}
                className="bg-primary hover:bg-primary/90 gap-2 px-8 h-14 text-lg"
              >
                Start Verifying <ArrowRight className="w-5 h-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => window.open('https://uhakikiai.onrender.com/api/v1/docs', '_blank')}
                className="gap-2 px-8 h-14 text-lg"
              >
                <Play className="w-5 h-5" /> View API Docs
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="text-center"
                >
                  <p className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-6 bg-muted/20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">Features</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything You Need to <span className="text-primary">Verify Trust</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Built for African institutions with cutting-edge AI technology
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative bg-background border border-border/50 rounded-2xl p-6 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
                <ChevronRight className="absolute top-6 right-6 w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* API Code Carousel */}
      <section id="api" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">Developer API</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Integrate in <span className="text-primary">Any Language</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our RESTful API works with every programming language. Copy, paste, and verify.
            </p>
          </motion.div>

          <CodeCarousel />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Button 
              size="lg"
              onClick={() => window.open('https://uhakikiai.onrender.com/api/v1/docs', '_blank')}
              className="bg-primary hover:bg-primary/90 gap-2"
            >
              View Full API Documentation <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-muted/20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">Testimonials</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Trusted by <span className="text-primary">Industry Leaders</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-background border border-border/50 rounded-2xl p-6"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">
                      {testimonial.author.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{testimonial.author}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.role}, {testimonial.company}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="py-16 px-6 border-y border-border/30">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-sm text-muted-foreground mb-8">
            Empowering Growth with African Institutions and Government Bodies
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            {partners.map((partner) => (
              <span 
                key={partner}
                className="text-xl font-bold text-muted-foreground/50 hover:text-primary transition-colors"
              >
                {partner}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent" />
        
        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join 150+ institutions using UhakikiAI to verify credentials and prevent fraud.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg"
                onClick={() => navigate('/auth')}
                className="bg-primary hover:bg-primary/90 gap-2 px-8 h-14 text-lg"
              >
                Get Your API Key <ArrowRight className="w-5 h-5" />
              </Button>
              <Button 
                size="lg"
                variant="outline"
                onClick={() => window.open('mailto:support@uhakiki.ai', '_blank')}
                className="gap-2 px-8 h-14 text-lg"
              >
                Talk to an Expert
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border/30 bg-muted/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img src={uhakikiLogo} alt="UhakikiAI" className="h-6 w-auto opacity-60" />
              <span className="text-sm text-muted-foreground">
                © 2024 UhakikiAI. The Trust Layer for African Credentials.
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="https://uhakikiai.onrender.com/api/v1/docs" target="_blank" className="hover:text-foreground transition-colors">API Docs</a>
              <a href="mailto:support@uhakiki.ai" className="hover:text-foreground transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
