import { useState } from 'react';
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
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

interface APIKey {
  id: string;
  name: string;
  key: string;
  createdAt: Date;
  lastUsed: Date | null;
  requestCount: number;
  status: 'active' | 'revoked';
}

// Generate a random API key
const generateAPIKey = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const prefix = 'uhk_live_';
  let key = prefix;
  for (let i = 0; i < 48; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
};

export function APIKeyManagement() {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([
    {
      id: '1',
      name: 'Production Key',
      key: 'uhk_live_aBcDeFgHiJkLmNoPqRsTuVwXyZ123456789012345678',
      createdAt: new Date('2024-01-15'),
      lastUsed: new Date('2024-01-18'),
      requestCount: 1247,
      status: 'active'
    }
  ]);
  const [newKeyName, setNewKeyName] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  const handleCreateKey = () => {
    if (!newKeyName.trim()) {
      toast.error('Please enter a name for your API key');
      return;
    }

    const newKey = generateAPIKey();
    const newApiKey: APIKey = {
      id: Date.now().toString(),
      name: newKeyName,
      key: newKey,
      createdAt: new Date(),
      lastUsed: null,
      requestCount: 0,
      status: 'active'
    };

    setApiKeys(prev => [newApiKey, ...prev]);
    setNewlyCreatedKey(newKey);
    setNewKeyName('');
    toast.success('API key created successfully');
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
                </DialogDescription>
              </DialogHeader>

              {!newlyCreatedKey ? (
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="keyName">Key Name</Label>
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
                    <Button onClick={handleCreateKey}>
                      Create Key
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
                  Quick Start Guide
                </CardTitle>
                <CardDescription>
                  Integrate UhakikiAI document verification into your application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Base URL */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Base URL</Label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-sm font-mono bg-muted/50 px-3 py-2 rounded-md border border-border/50">
                      https://api.uhakiki.ai/v1
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        navigator.clipboard.writeText('https://api.uhakiki.ai/v1');
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
                    Include your API key in the Authorization header:
                  </p>
                  <pre className="bg-[#1e1e2e] text-[#cdd6f4] p-4 rounded-lg text-sm font-mono overflow-x-auto border border-border/50">
{`Authorization: Bearer uhk_live_your_api_key`}
                  </pre>
                </div>

                {/* Example Request */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Verify Document (cURL)</Label>
                  <pre className="bg-[#1e1e2e] text-[#cdd6f4] p-4 rounded-lg text-sm font-mono overflow-x-auto border border-border/50">
{`curl -X POST https://api.uhakiki.ai/v1/verify \\
  -H "Authorization: Bearer uhk_live_your_api_key" \\
  -H "Content-Type: multipart/form-data" \\
  -F "document=@/path/to/document.pdf" \\
  -F "type=certificate"`}
                  </pre>
                </div>

                {/* JavaScript Example */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">JavaScript / TypeScript</Label>
                  <pre className="bg-[#1e1e2e] text-[#cdd6f4] p-4 rounded-lg text-sm font-mono overflow-x-auto border border-border/50">
{`const response = await fetch('https://api.uhakiki.ai/v1/verify', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer uhk_live_your_api_key',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    document_url: 'https://example.com/document.pdf',
    type: 'certificate',
    biometric_check: true
  })
});

const result = await response.json();
console.log(result.verification_status);`}
                  </pre>
                </div>

                {/* Response Example */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Response Example</Label>
                  <pre className="bg-[#1e1e2e] text-[#cdd6f4] p-4 rounded-lg text-sm font-mono overflow-x-auto border border-border/50">
{`{
  "id": "ver_1234567890",
  "status": "completed",
  "verification_status": "authentic",
  "confidence_score": 0.97,
  "document_type": "certificate",
  "extracted_data": {
    "name": "John Doe",
    "institution": "University of Nairobi",
    "date_issued": "2024-01-15"
  },
  "fraud_indicators": [],
  "biometric_match": 0.94,
  "created_at": "2024-01-18T10:30:00Z"
}`}
                  </pre>
                </div>

                <div className="pt-4 border-t border-border/50">
                  <Button variant="outline" className="gap-2">
                    <ExternalLink className="w-4 h-4" />
                    View Full API Documentation
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
