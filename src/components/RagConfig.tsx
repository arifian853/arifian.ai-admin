import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
    RefreshCw,
    Brain,
    Search,
    MessageSquare,
    CheckCircle,
    AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface ChunkingConfig {
    min_chunk_size: number;
    target_chunk_size: number;
    chunk_overlap: number;
    max_chunk_size: number;
}

interface EmbeddingConfig {
    model_name: string;
    dimension: number;
    supports_languages: string[];
    description: string;
}

interface SearchConfig {
    min_similarity_threshold: number;
    default_retrieval_limit: number;
    chunking: ChunkingConfig;
}

interface ChatConfig {
    llm_model: string;
    retrieval_limit: number;
    min_similarity_threshold: number;
}

interface FullConfig {
    status: string;
    embedding: EmbeddingConfig;
    search: SearchConfig;
    chat: ChatConfig;
}

interface HealthStatus {
    status: string;
    timestamp: string;
    components?: {
        embedding?: { status: string; model?: string; error?: string };
        chat?: { status: string; llm_model?: string; error?: string };
    };
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:7860';

export const RagConfig = () => {
    const [config, setConfig] = useState<FullConfig | null>(null);
    const [health, setHealth] = useState<HealthStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchConfig = async () => {
        try {
            const response = await fetch(`${BACKEND_URL}/config`);
            if (!response.ok) throw new Error('Failed to fetch config');
            const data = await response.json();
            setConfig(data);
        } catch (error) {
            console.error('Error fetching config:', error);
            toast.error('Failed to fetch configuration');
        }
    };

    const fetchHealth = async () => {
        try {
            const response = await fetch(`${BACKEND_URL}/health/detailed`);
            if (!response.ok) throw new Error('Failed to fetch health');
            const data = await response.json();
            setHealth(data);
        } catch (error) {
            console.error('Error fetching health:', error);
            toast.error('Failed to fetch health status');
        }
    };

    const loadAll = async () => {
        setLoading(true);
        await Promise.all([fetchConfig(), fetchHealth()]);
        setLoading(false);
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await Promise.all([fetchConfig(), fetchHealth()]);
        setRefreshing(false);
        toast.success('Configuration refreshed');
    };

    useEffect(() => {
        loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-32 w-full" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Skeleton className="h-64" />
                    <Skeleton className="h-64" />
                    <Skeleton className="h-64" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with Health Status */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold text-foreground">RAG Configuration</h2>
                    {health && (
                        <Badge
                            variant={health.status === 'healthy' ? 'default' : 'destructive'}
                            className="gap-1"
                        >
                            {health.status === 'healthy' ? (
                                <CheckCircle className="w-3 h-3" />
                            ) : (
                                <AlertCircle className="w-3 h-3" />
                            )}
                            {health.status.toUpperCase()}
                        </Badge>
                    )}
                </div>
                <Button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    variant="outline"
                    className="gap-2"
                >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Component Health Cards */}
            {health?.components && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Embedding Health */}
                    <Card className="border-border">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-accent/20 flex items-center justify-center">
                                        <Brain className="w-5 h-5 text-accent" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-foreground">Embedding Service</p>
                                        <p className="text-sm text-muted-foreground">
                                            {health.components.embedding?.model || 'Unknown'}
                                        </p>
                                    </div>
                                </div>
                                <Badge variant={health.components.embedding?.status === 'healthy' ? 'default' : 'destructive'}>
                                    {health.components.embedding?.status || 'Unknown'}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Chat Health */}
                    <Card className="border-border">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-accent/20 flex items-center justify-center">
                                        <MessageSquare className="w-5 h-5 text-accent" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-foreground">Chat Service</p>
                                        <p className="text-sm text-muted-foreground">
                                            {health.components.chat?.llm_model || 'Unknown'}
                                        </p>
                                    </div>
                                </div>
                                <Badge variant={health.components.chat?.status === 'healthy' ? 'default' : 'destructive'}>
                                    {health.components.chat?.status || 'Unknown'}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Configuration Cards */}
            {config && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Embedding Config */}
                    <Card className="border-border">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <Brain className="w-5 h-5 text-accent" />
                                <CardTitle className="text-lg">Embedding Model</CardTitle>
                            </div>
                            <CardDescription>Multilingual embedding configuration</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Model</span>
                                    <Badge variant="secondary" className="font-mono text-xs">
                                        {config.embedding.model_name.split('/').pop()}
                                    </Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Dimension</span>
                                    <span className="text-sm font-medium text-foreground">
                                        {config.embedding.dimension}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-sm text-muted-foreground block mb-2">Supported Languages</span>
                                    <div className="flex flex-wrap gap-1">
                                        {config.embedding.supports_languages.slice(0, 6).map((lang, i) => (
                                            <Badge key={i} variant="outline" className="text-xs">
                                                {lang}
                                            </Badge>
                                        ))}
                                        {config.embedding.supports_languages.length > 6 && (
                                            <Badge variant="outline" className="text-xs">
                                                +{config.embedding.supports_languages.length - 6} more
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Search Config */}
                    <Card className="border-border">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <Search className="w-5 h-5 text-accent" />
                                <CardTitle className="text-lg">Search Settings</CardTitle>
                            </div>
                            <CardDescription>Retrieval configuration</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Similarity Threshold</span>
                                    <Badge variant="secondary">
                                        {(config.search.min_similarity_threshold * 100).toFixed(0)}%
                                    </Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Retrieval Limit</span>
                                    <span className="text-sm font-medium text-foreground">
                                        {config.search.default_retrieval_limit} docs
                                    </span>
                                </div>
                                <div className="pt-2 border-t border-border">
                                    <span className="text-xs text-muted-foreground block mb-2">Chunking</span>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div className="bg-accent/10 p-2">
                                            <span className="text-muted-foreground">Min Size</span>
                                            <p className="font-medium text-foreground">{config.search.chunking.min_chunk_size}</p>
                                        </div>
                                        <div className="bg-accent/10 p-2">
                                            <span className="text-muted-foreground">Target</span>
                                            <p className="font-medium text-foreground">{config.search.chunking.target_chunk_size}</p>
                                        </div>
                                        <div className="bg-accent/10 p-2">
                                            <span className="text-muted-foreground">Overlap</span>
                                            <p className="font-medium text-foreground">{config.search.chunking.chunk_overlap}</p>
                                        </div>
                                        <div className="bg-accent/10 p-2">
                                            <span className="text-muted-foreground">Max Size</span>
                                            <p className="font-medium text-foreground">{config.search.chunking.max_chunk_size}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Chat Config */}
                    <Card className="border-border">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-accent" />
                                <CardTitle className="text-lg">Chat Settings</CardTitle>
                            </div>
                            <CardDescription>LLM configuration</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">LLM Model</span>
                                    <Badge variant="secondary" className="font-mono text-xs">
                                        {config.chat.llm_model}
                                    </Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Retrieval Limit</span>
                                    <span className="text-sm font-medium text-foreground">
                                        {config.chat.retrieval_limit} docs
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Min Similarity</span>
                                    <Badge variant="secondary">
                                        {(config.chat.min_similarity_threshold * 100).toFixed(0)}%
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* System Info */}
            {health && (
                <Card className="border-border">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>Last updated: {new Date(health.timestamp).toLocaleString()}</span>
                            <span>API Version: 2.0.0</span>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default RagConfig;
