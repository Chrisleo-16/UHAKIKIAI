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
  ServerCrash
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
import { API_BASE_URL, generateAPIKey, registerCompany } from '@/lib/api';

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
  const { user, profile } = useAuth();
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'online' | 'offline' | 'checking'>('checking');

  // Check backend status on mount
  useEffect(() => {
    checkBackendStatus();
  }, []);

  const checkBackendStatus = async () => {
    setBackendStatus('checking');
    try {
      const response = await fetch(`${API_BASE_URL}/docs`, { method: 'HEAD' });
      setBackendStatus(response.ok ? 'online' : 'offline');
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
      } catch (error: any) {
        // Company might already exist, continue to generate key
        if (!error.message.includes('already')) {
          console.log('Registration note:', error.message);
        }
      }

      // Generate the API key
      const response = await generateAPIKey(user.email);
      
      const newApiKey: APIKey = {
        id: Date.now().toString(),
        name: newKeyName,
        key: response.api_key,
        prefix: response.api_key.substring(0, 10),
        createdAt: new Date(),
        lastUsed: null,
        requestCount: 0,
        status: 'active'
      };

      setApiKeys(prev => [newApiKey, ...prev]);
      setNewlyCreatedKey(response.api_key);
      setNewKeyName('');
      toast.success('API key created successfully via Python backend!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create API key');
    } finally {
      setIsLoading(false);
    }
  };

  // Fallback: Generate key locally if backend is offline
  const handleCreateKeyLocal = () => {
    if (!newKeyName.trim()) {
      toast.error('Please enter a name for your API key');
      return;
    }

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const prefix = 'uh_live_';
    let key = prefix;
    for (let i = 0; i < 48; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const newApiKey: APIKey = {
      id: Date.now().toString(),
      name: newKeyName,
      key: key,
      prefix: key.substring(0, 10),
      createdAt: new Date(),
      lastUsed: null,
      requestCount: 0,
      status: 'active'
    };

    setApiKeys(prev => [newApiKey, ...prev]);
    setNewlyCreatedKey(key);
    setNewKeyName('');
    toast.success('API key created locally (backend offline)');
  };

  const handleCreateKey = () => {
    if (backendStatus === 'online') {
      handleRegisterAndCreateKey();
    } else {
      handleCreateKeyLocal();
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
    return key.substring(0, 12) + '•'.repeat(32) + key.substring(key.length - 4);
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

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/30">
                <Key className="w-5 h-5 text-primary" />
              </div>
              API Keys
            </h1>
            <p className="text-muted-foreground mt-1">
              Create and manage API keys for external document verification
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Backend Status Indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border/50">
              {backendStatus === 'checking' ? (
                <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
              ) : backendStatus === 'online' ? (
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              ) : (
                <div className="w-2 h-2 rounded-full bg-warning" />
              )}
              <span className="text-xs text-muted-foreground">
                Python API: {backendStatus === 'checking' ? 'Checking...' : backendStatus}
              </span>
            </div>

            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 gap-2">
                  <Plus className="w-4 h-4" />
                  Create New Key
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Create New API Key</DialogTitle>
                  <DialogDescription>
                    Create a new API key to authenticate external verification requests.
                    {backendStatus === 'online' && (
                      <span className="block mt-1 text-primary">
                        Connected to Python backend at {API_BASE_URL}
                      </span>
                    )}
                  </DialogDescription>
                </DialogHeader>

                {!newlyCreatedKey ? (
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="keyName">Key Name / Company Name</Label>
                      <Input
                        id="keyName"
                        placeholder="e.g., Production, Development, Partner Integration"
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        A descriptive name to help you identify this key later
                      </p>
                    </div>

                    {backendStatus === 'offline' && (
                      <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg flex gap-3">
                        <ServerCrash className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-warning">Backend Offline</p>
                          <p className="text-muted-foreground mt-1">
                            The Python API is not reachable. Key will be generated locally.
                            Start your FastAPI server at {API_BASE_URL}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg flex gap-3">
                      <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-warning">Security Notice</p>
                        <p className="text-muted-foreground mt-1">
                          Your API key will only be shown once. Make sure to copy and store it securely.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 py-4">
                    <div className="p-4 bg-accent/50 rounded-lg border border-border">
                      <Label className="text-xs text-muted-foreground mb-2 block">Your New API Key</Label>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-sm font-mono bg-background p-3 rounded-md border break-all">
                          {newlyCreatedKey}
                        </code>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleCopyKey(newlyCreatedKey, 'new')}
                        >
                          {copiedKeyId === 'new' ? (
                            <Check className="w-4 h-4 text-primary" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex gap-3">
                      <Shield className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-destructive">Important</p>
                        <p className="text-muted-foreground mt-1">
                          This key won't be shown again. Copy it now and store it in a secure location.
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
                      <Button onClick={handleCreateKey} disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Creating...
                          </>
                        ) : (
                          'Create Key'
                        )}
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => {
                      setShowCreateDialog(false);
                      setNewlyCreatedKey(null);
                    }}>
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
          <Card className="glass-card border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Key className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{activeKeys}</p>
                <p className="text-sm text-muted-foreground">Active Keys</p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/30 flex items-center justify-center">
                <Activity className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalRequests.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Requests</p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/30 flex items-center justify-center">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">30d</p>
                <p className="text-sm text-muted-foreground">Key Retention</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <Tabs defaultValue="keys" className="space-y-4">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="keys">API Keys</TabsTrigger>
            <TabsTrigger value="docs">Quick Start</TabsTrigger>
          </TabsList>

          <TabsContent value="keys" className="space-y-4">
            <AnimatePresence mode="popLayout">
              {apiKeys.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                    <Key className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">No API Keys</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first API key to start integrating
                  </p>
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create API Key
                  </Button>
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
                    <Card className={`glass-card border-border/50 ${apiKey.status === 'revoked' ? 'opacity-60' : ''}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-foreground">{apiKey.name}</h3>
                              <Badge 
                                variant={apiKey.status === 'active' ? 'default' : 'secondary'}
                                className={apiKey.status === 'active' 
                                  ? 'bg-primary/20 text-primary border-primary/30' 
                                  : 'bg-muted text-muted-foreground'
                                }
                              >
                                {apiKey.status}
                              </Badge>
                            </div>

                            <div className="flex items-center gap-2 mb-3">
                              <code className="flex-1 text-sm font-mono bg-muted/50 px-3 py-2 rounded-md border border-border/50 truncate">
                                {visibleKeys.has(apiKey.id) ? apiKey.key : maskKey(apiKey.key)}
                              </code>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => toggleKeyVisibility(apiKey.id)}
                                className="shrink-0"
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
                                className="shrink-0"
                              >
                                {copiedKeyId === apiKey.id ? (
                                  <Check className="w-4 h-4 text-primary" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </Button>
                            </div>

                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Created {formatDate(apiKey.createdAt)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Activity className="w-3 h-3" />
                                {apiKey.requestCount.toLocaleString()} requests
                              </span>
                              {apiKey.lastUsed && (
                                <span>
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
                                <RefreshCw className="w-3 h-3 mr-1" />
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
            <Card className="glass-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5 text-primary" />
                  Quick Start Guide - Python Backend
                </CardTitle>
                <CardDescription>
                  Integrate UhakikiAI document verification using your Python FastAPI backend
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Base URL */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Base URL (Your FastAPI Server)</Label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-sm font-mono bg-muted/50 px-3 py-2 rounded-md border border-border/50">
                      {API_BASE_URL}
                    </code>
                    <Button
                      variant="ghost"
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
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Authentication</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Include your API key in the X-API-Key header:
                  </p>
                  <pre className="bg-[#1e1e2e] text-[#cdd6f4] p-4 rounded-lg text-sm font-mono overflow-x-auto border border-border/50">
{`X-API-Key: uh_live_your_api_key`}
                  </pre>
                </div>

                {/* Example Request - cURL */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Verify Document (cURL)</Label>
                  <pre className="bg-[#1e1e2e] text-[#cdd6f4] p-4 rounded-lg text-sm font-mono overflow-x-auto border border-border/50">
{`curl -X POST ${API_BASE_URL}/v1/verify_document \\
  -H "X-API-Key: uh_live_your_api_key" \\
  -F "file=@/path/to/certificate.jpg"`}
                  </pre>
                </div>

                {/* Python Example */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Python</Label>
                  <pre className="bg-[#1e1e2e] text-[#cdd6f4] p-4 rounded-lg text-sm font-mono overflow-x-auto border border-border/50">
{`import requests

API_KEY = "uh_live_your_api_key"
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
print(f"Flags: {result['flags']}")`}
                  </pre>
                </div>

                {/* JavaScript Example */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">JavaScript / TypeScript</Label>
                  <pre className="bg-[#1e1e2e] text-[#cdd6f4] p-4 rounded-lg text-sm font-mono overflow-x-auto border border-border/50">
{`const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch('${API_BASE_URL}/v1/verify_document', {
  method: 'POST',
  headers: {
    'X-API-Key': 'uh_live_your_api_key'
  },
  body: formData
});

const result = await response.json();
console.log(result.status);  // "VERIFIED" | "FLAGGED" | "ERROR"
console.log(result.score);   // 0-100
console.log(result.flags);   // Array of fraud indicators`}
                  </pre>
                </div>

                {/* Response Example */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Response Example</Label>
                  <pre className="bg-[#1e1e2e] text-[#cdd6f4] p-4 rounded-lg text-sm font-mono overflow-x-auto border border-border/50">
{`{
  "status": "VERIFIED",
  "score": 95,
  "flags": [],
  "data": {
    "name": "John Kamau",
    "institution": "Kenya National Examinations Council"
  }
}

// Flagged Response:
{
  "status": "FLAGGED",
  "score": 40,
  "flags": [
    "Suspected Synthetic Image (Low Noise)",
    "Grade Mismatch (Expected A-)"
  ],
  "data": {
    "name": "Jane Doe",
    "institution": "Unknown"
  }
}`}
                  </pre>
                </div>

                {/* Running the Backend */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Running Your Python Backend</Label>
                  <pre className="bg-[#1e1e2e] text-[#cdd6f4] p-4 rounded-lg text-sm font-mono overflow-x-auto border border-border/50">
{`# Install dependencies
pip install -r requirements.txt

# Run the server
python main.py

# Or with uvicorn
uvicorn main:app --reload --host 0.0.0.0 --port 8000`}
                  </pre>
                </div>

                <div className="pt-4 border-t border-border/50">
                  <Button 
                    variant="outline" 
                    className="gap-2"
                    onClick={() => window.open(`${API_BASE_URL}/docs`, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4" />
                    View FastAPI Swagger Docs
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
