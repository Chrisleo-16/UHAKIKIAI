import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Key, 
  Plus, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  Trash2, 
  RefreshCw,
  Clock,
  Activity,
  Shield,
  Code,
  AlertTriangle,
  ExternalLink,
  Loader2,
  Zap,
  Terminal,
  Globe,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { API_BASE_URL, generateAPIKey, registerCompany, checkBackendHealth, getDocsUrl } from '@/lib/api';

interface APIKey {
  id: string;
  name: string;
  key: string;
  prefix: string;
  createdAt: Date;
  lastUsed: Date | null;
  requestCount: number;
  status: 'active' | 'revoked';
}

export function APIKeyManagement() {
  const { user } = useAuth();
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const [activeDocTab, setActiveDocTab] = useState('curl');

  // Check backend status on mount
  useEffect(() => {
    checkBackendStatus();
  }, []);

  const checkBackendStatus = async () => {
    setBackendStatus('checking');
    try {
      await checkBackendHealth();
      setBackendStatus('online');
    } catch {
      setBackendStatus('offline');
    }
  };

  const handleRegisterAndCreateKey = async () => {
    if (!newKeyName.trim()) {
      toast.error('Please enter a name for your API key');
      return;
    }

    if (!user?.email) {
      toast.error('You must be logged in to create an API key');
      return;
    }

    setIsLoading(true);

    try {
      // First, register the company if not already registered
      try {
        await registerCompany(newKeyName, user.email);
        toast.success('Company registered successfully');
      } catch (error: any) {
        // Company might already exist, continue to generate key
        console.log('Registration note:', error.message);
      }

      // Generate the API key
      const response = await generateAPIKey(user.email);
      
      const newApiKey: APIKey = {
        id: Date.now().toString(),
        name: newKeyName,
        key: response.api_key,
        prefix: response.api_key.substring(0, 12),
        createdAt: new Date(),
        lastUsed: null,
        requestCount: 0,
        status: 'active'
      };

      setApiKeys(prev => [newApiKey, ...prev]);
      setNewlyCreatedKey(response.api_key);
      setNewKeyName('');
      toast.success('API key generated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create API key');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyKey = async (key: string, keyId: string) => {
    await navigator.clipboard.writeText(key);
    setCopiedKeyId(keyId);
    toast.success('API key copied to clipboard');
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const handleRevokeKey = (keyId: string) => {
    setApiKeys(prev => prev.map(k => 
      k.id === keyId ? { ...k, status: 'revoked' as const } : k
    ));
    toast.success('API key revoked');
  };

  const handleDeleteKey = (keyId: string) => {
    setApiKeys(prev => prev.filter(k => k.id !== keyId));
    toast.success('API key deleted');
  };

  const toggleKeyVisibility = (keyId: string) => {
    setVisibleKeys(prev => {
      const next = new Set(prev);
      if (next.has(keyId)) {
        next.delete(keyId);
      } else {
        next.add(keyId);
      }
      return next;
    });
  };

  const maskKey = (key: string) => {
    return key.substring(0, 12) + '•'.repeat(24) + key.substring(key.length - 4);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const totalRequests = apiKeys.reduce((sum, k) => sum + k.requestCount, 0);
  const activeKeys = apiKeys.filter(k => k.status === 'active').length;

  // Code examples for documentation
  const codeExamples = {
    curl: `curl -X POST "${API_BASE_URL}/v1/verify_document" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -F "file=@/path/to/certificate.jpg"`,
    
    python: `import requests

API_KEY = "YOUR_API_KEY"
API_URL = "${API_BASE_URL}/v1/verify_document"

with open("certificate.jpg", "rb") as f:
    response = requests.post(
        API_URL,
        headers={"X-API-Key": API_KEY},
        files={"file": f}
    )

result = response.json()
print(f"Status: {result['status']}")
print(f"Score: {result['score']}")
print(f"Flags: {result['flags']}")`,
    
    javascript: `const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch(
  '${API_BASE_URL}/v1/verify_document',
  {
    method: 'POST',
    headers: { 'X-API-Key': 'YOUR_API_KEY' },
    body: formData
  }
);

const result = await response.json();
console.log(result.status);  // "VERIFIED" | "FLAGGED"
console.log(result.score);   // 0-100
console.log(result.flags);   // Fraud indicators`,
    
    go: `package main

import (
    "bytes"
    "mime/multipart"
    "net/http"
    "os"
)

func verifyDocument(filePath, apiKey string) (*http.Response, error) {
    file, _ := os.Open(filePath)
    defer file.Close()

    body := &bytes.Buffer{}
    writer := multipart.NewWriter(body)
    part, _ := writer.CreateFormFile("file", filePath)
    io.Copy(part, file)
    writer.Close()

    req, _ := http.NewRequest("POST", 
        "${API_BASE_URL}/v1/verify_document", body)
    req.Header.Set("X-API-Key", apiKey)
    req.Header.Set("Content-Type", writer.FormDataContentType())

    return http.DefaultClient.Do(req)
}`
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center border border-primary/40 shadow-lg shadow-primary/20">
                <Key className="w-6 h-6 text-primary" />
              </div>
              API Keys
            </h1>
            <p className="text-muted-foreground mt-2 max-w-md">
              Generate and manage API keys to integrate UhakikiAI document verification into your applications.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Backend Status Indicator */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border shadow-sm"
            >
              {backendStatus === 'checking' ? (
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              ) : backendStatus === 'online' ? (
                <div className="relative">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <div className="absolute inset-0 w-3 h-3 rounded-full bg-primary animate-ping opacity-75" />
                </div>
              ) : (
                <div className="w-3 h-3 rounded-full bg-warning" />
              )}
              <span className="text-sm font-medium">
                {backendStatus === 'checking' ? 'Connecting...' : backendStatus === 'online' ? 'API Online' : 'API Offline'}
              </span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6" 
                onClick={checkBackendStatus}
              >
                <RefreshCw className={`w-3 h-3 ${backendStatus === 'checking' ? 'animate-spin' : ''}`} />
              </Button>
            </motion.div>

            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 gap-2 shadow-lg shadow-primary/25">
                  <Plus className="w-4 h-4" />
                  Create New Key
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    Create New API Key
                  </DialogTitle>
                  <DialogDescription>
                    Generate a new API key to authenticate your document verification requests.
                  </DialogDescription>
                </DialogHeader>

                {!newlyCreatedKey ? (
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="keyName">Company / Project Name</Label>
                      <Input
                        id="keyName"
                        placeholder="e.g., Acme University, HR Portal, Partner App"
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                        className="bg-background border-border"
                      />
                      <p className="text-xs text-muted-foreground">
                        A descriptive name to identify this API key
                      </p>
                    </div>

                    {backendStatus === 'offline' && (
                      <div className="p-4 bg-warning/10 border border-warning/30 rounded-xl flex gap-3">
                        <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-semibold text-warning">Backend Unavailable</p>
                          <p className="text-muted-foreground mt-1">
                            Cannot connect to the Python API at {API_BASE_URL}. Please ensure the server is running.
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl flex gap-3">
                      <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-semibold text-primary">Security Notice</p>
                        <p className="text-muted-foreground mt-1">
                          Your API key will only be shown once. Store it securely and never expose it in client-side code.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 py-4">
                    <div className="p-4 bg-primary/10 rounded-xl border border-primary/30">
                      <Label className="text-xs text-muted-foreground mb-2 block">Your New API Key</Label>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-sm font-mono bg-background p-3 rounded-lg border border-border break-all text-primary">
                          {newlyCreatedKey}
                        </code>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleCopyKey(newlyCreatedKey, 'new')}
                          className="shrink-0"
                        >
                          {copiedKeyId === 'new' ? (
                            <Check className="w-4 h-4 text-primary" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl flex gap-3">
                      <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-semibold text-destructive">Save This Key Now</p>
                        <p className="text-muted-foreground mt-1">
                          This key won't be displayed again. Copy and store it in a secure location.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <DialogFooter>
                  {!newlyCreatedKey ? (
                    <>
                      <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleRegisterAndCreateKey} 
                        disabled={isLoading || backendStatus !== 'online'}
                        className="gap-2"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4" />
                            Generate Key
                          </>
                        )}
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => {
                      setShowCreateDialog(false);
                      setNewlyCreatedKey(null);
                    }} className="w-full">
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Done
                    </Button>
                  )}
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20 shadow-lg shadow-primary/5">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center">
                <Key className="w-7 h-7 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">{activeKeys}</p>
                <p className="text-sm text-muted-foreground">Active Keys</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent/30 to-transparent border-border/50 shadow-lg">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-accent/50 flex items-center justify-center">
                <Activity className="w-7 h-7 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">{totalRequests.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Requests</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent/30 to-transparent border-border/50 shadow-lg">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-accent/50 flex items-center justify-center">
                <Globe className="w-7 h-7 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground font-mono text-lg">{API_BASE_URL.replace('https://', '')}</p>
                <p className="text-sm text-muted-foreground">API Endpoint</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <Tabs defaultValue="keys" className="space-y-6">
          <TabsList className="bg-card border border-border p-1">
            <TabsTrigger value="keys" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Key className="w-4 h-4" />
              API Keys
            </TabsTrigger>
            <TabsTrigger value="docs" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Code className="w-4 h-4" />
              Quick Start
            </TabsTrigger>
          </TabsList>

          <TabsContent value="keys" className="space-y-4">
            <AnimatePresence mode="popLayout">
              {apiKeys.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Card className="border-dashed border-2 border-border bg-transparent">
                    <CardContent className="py-16 text-center">
                      <div className="w-20 h-20 rounded-3xl bg-muted/50 flex items-center justify-center mx-auto mb-6">
                        <Key className="w-10 h-10 text-muted-foreground" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">No API Keys Yet</h3>
                      <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                        Create your first API key to start integrating document verification into your applications.
                      </p>
                      <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Create Your First Key
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                apiKeys.map((apiKey, index) => (
                  <motion.div
                    key={apiKey.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className={`border-border/50 bg-card ${apiKey.status === 'revoked' ? 'opacity-60' : ''}`}>
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-3">
                              <h3 className="font-semibold text-lg text-foreground">{apiKey.name}</h3>
                              <Badge 
                                variant={apiKey.status === 'active' ? 'default' : 'secondary'}
                                className={apiKey.status === 'active' 
                                  ? 'bg-primary/20 text-primary border-primary/30 hover:bg-primary/30' 
                                  : 'bg-muted text-muted-foreground'
                                }
                              >
                                {apiKey.status === 'active' ? (
                                  <><CheckCircle2 className="w-3 h-3 mr-1" /> Active</>
                                ) : (
                                  'Revoked'
                                )}
                              </Badge>
                            </div>

                            <div className="flex items-center gap-2 mb-4">
                              <code className="flex-1 text-sm font-mono bg-background px-4 py-2.5 rounded-lg border border-border truncate">
                                {visibleKeys.has(apiKey.id) ? apiKey.key : maskKey(apiKey.key)}
                              </code>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => toggleKeyVisibility(apiKey.id)}
                                className="shrink-0 hover:bg-accent"
                              >
                                {visibleKeys.has(apiKey.id) ? (
                                  <EyeOff className="w-4 h-4" />
                                ) : (
                                  <Eye className="w-4 h-4" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleCopyKey(apiKey.key, apiKey.id)}
                                className="shrink-0 hover:bg-accent"
                              >
                                {copiedKeyId === apiKey.id ? (
                                  <Check className="w-4 h-4 text-primary" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </Button>
                            </div>

                            <div className="flex items-center gap-5 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                Created {formatDate(apiKey.createdAt)}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Activity className="w-3.5 h-3.5" />
                                {apiKey.requestCount.toLocaleString()} requests
                              </span>
                              {apiKey.lastUsed && (
                                <span className="flex items-center gap-1.5">
                                  <Zap className="w-3.5 h-3.5" />
                                  Last used {formatDate(apiKey.lastUsed)}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {apiKey.status === 'active' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRevokeKey(apiKey.id)}
                                className="text-warning border-warning/30 hover:bg-warning/10"
                              >
                                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                                Revoke
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteKey(apiKey.id)}
                              className="text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="docs">
            <Card className="border-border bg-card overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent border-b border-border">
                <CardTitle className="flex items-center gap-3">
                  <Terminal className="w-6 h-6 text-primary" />
                  Quick Start Guide
                </CardTitle>
                <CardDescription>
                  Integrate UhakikiAI document verification in minutes
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-8">
                {/* Base URL */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <Globe className="w-4 h-4 text-primary" />
                    API Base URL
                  </Label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-sm font-mono bg-background px-4 py-3 rounded-lg border border-border text-primary">
                      {API_BASE_URL}
                    </code>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        navigator.clipboard.writeText(API_BASE_URL);
                        toast.success('Copied to clipboard');
                      }}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Authentication */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    Authentication Header
                  </Label>
                  <pre className="bg-[#0d1117] text-[#c9d1d9] p-4 rounded-xl text-sm font-mono overflow-x-auto border border-[#30363d]">
                    <code>X-API-Key: YOUR_API_KEY</code>
                  </pre>
                </div>

                {/* Code Examples Tabs */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <Code className="w-4 h-4 text-primary" />
                    Code Examples
                  </Label>
                  
                  <div className="rounded-xl border border-[#30363d] overflow-hidden">
                    <div className="flex bg-[#161b22] border-b border-[#30363d]">
                      {(['curl', 'python', 'javascript', 'go'] as const).map((lang) => (
                        <button
                          key={lang}
                          onClick={() => setActiveDocTab(lang)}
                          className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                            activeDocTab === lang
                              ? 'bg-[#0d1117] text-primary border-b-2 border-primary'
                              : 'text-[#8b949e] hover:text-[#c9d1d9]'
                          }`}
                        >
                          {lang === 'curl' ? 'cURL' : lang.charAt(0).toUpperCase() + lang.slice(1)}
                        </button>
                      ))}
                    </div>
                    <pre className="bg-[#0d1117] text-[#c9d1d9] p-5 text-sm font-mono overflow-x-auto max-h-80">
                      <code>{codeExamples[activeDocTab as keyof typeof codeExamples]}</code>
                    </pre>
                  </div>
                </div>

                {/* Response Example */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    Response Example
                  </Label>
                  <pre className="bg-[#0d1117] text-[#c9d1d9] p-5 rounded-xl text-sm font-mono overflow-x-auto border border-[#30363d]">
{`{
  "status": "VERIFIED",
  "score": 95,
  "flags": [],
  "data": {
    "name": "John Kamau",
    "institution": "Kenya National Examinations Council"
  }
}`}
                  </pre>
                </div>

                <div className="pt-4 border-t border-border flex flex-wrap gap-3">
                  <Button 
                    variant="outline" 
                    className="gap-2"
                    onClick={() => window.open(getDocsUrl(), '_blank')}
                  >
                    <ExternalLink className="w-4 h-4" />
                    Swagger Documentation
                  </Button>
                  <Button 
                    variant="outline" 
                    className="gap-2"
                    onClick={() => window.open(`${API_BASE_URL}/api/v1/redoc`, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4" />
                    ReDoc Reference
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
