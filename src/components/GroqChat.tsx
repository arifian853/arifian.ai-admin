/**
 * Chat Component (Groq LLaMA 3.3 70B)
 * 
 * Chat interface for the RAG AI assistant.
 * Uses /chat endpoint with Groq LLaMA 3.3 70B Versatile.
 * 
 * Features:
 * - Real-time chat with Groq model
 * - Response time metrics display
 * - Source document attribution
 * - Health status indicator
 */

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Send,
    Bot,
    User,
    Clock,
    FileText,
    RefreshCw,
    Zap,
    AlertCircle,
    CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

// Types
interface Message {
    role: 'user' | 'assistant';
    content: string;
    sources?: SourceDoc[];
    duration?: number;
    apiDuration?: number;
    timestamp: Date;
}

interface SourceDoc {
    _id: string;
    title: string;
    content: string;
    similarity_score: number;
    file_info?: {
        filename: string;
        cloudinary_url?: string;
    };
}

interface ChatResponse {
    response: string;
    sources: SourceDoc[];
    model: string;
    provider: string;
    duration_seconds: number;
    api_duration_seconds: number;
}

// Backend URL
const BACKEND_URL = import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:7860';

export const GroqChat = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
    const [modelInfo, setModelInfo] = useState<string>('llama-3.3-70b-versatile');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Check health on mount
    useEffect(() => {
        checkHealth();
    }, []);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const checkHealth = async () => {
        try {
            const response = await fetch(`${BACKEND_URL}/chat/health`);
            const data = await response.json();
            setIsHealthy(data.status === 'healthy');
            if (data.model) {
                setModelInfo(data.model);
            }
        } catch {
            setIsHealthy(false);
        }
    };

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            role: 'user',
            content: input.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // Build history for context
            const history = messages.map(msg => ({
                [msg.role === 'user' ? 'user' : 'assistant']: msg.content
            }));

            const response = await fetch(`${BACKEND_URL}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: userMessage.content,
                    history: history
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP ${response.status}`);
            }

            const data: ChatResponse = await response.json();

            const assistantMessage: Message = {
                role: 'assistant',
                content: data.response,
                sources: data.sources,
                duration: data.duration_seconds,
                apiDuration: data.api_duration_seconds,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, assistantMessage]);

        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            toast.error(`Failed to send message: ${errorMessage}`);

            // Remove user message on error
            setMessages(prev => prev.slice(0, -1));
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const clearChat = () => {
        setMessages([]);
        toast.success('Chat cleared');
    };

    const getScoreBadgeVariant = (score: number): 'default' | 'secondary' | 'destructive' => {
        if (score >= 0.5) return 'default';
        if (score >= 0.35) return 'secondary';
        return 'destructive';
    };

    return (
        <div className="flex flex-col h-[calc(100vh-12rem)]">
            {/* Header */}
            <Card className="border-border mb-4">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-500/20 flex items-center justify-center rounded-lg">
                                <Zap className="w-5 h-5 text-orange-500" />
                            </div>
                            <div>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    Groq Chat
                                    <Badge variant="secondary" className="text-xs">
                                        LLaMA 3.3 70B
                                    </Badge>
                                </CardTitle>
                                <CardDescription>
                                    RAG Chat with Groq LLaMA 3.3 70B (endpoint: /chat)
                                </CardDescription>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {isHealthy === null ? (
                                <Badge variant="secondary" className="gap-1">
                                    <RefreshCw className="w-3 h-3 animate-spin" />
                                    Checking...
                                </Badge>
                            ) : isHealthy ? (
                                <Badge variant="default" className="gap-1 bg-green-500">
                                    <CheckCircle className="w-3 h-3" />
                                    Healthy
                                </Badge>
                            ) : (
                                <Badge variant="destructive" className="gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    Unhealthy
                                </Badge>
                            )}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={clearChat}
                                disabled={messages.length === 0}
                            >
                                Clear
                            </Button>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Messages Area */}
            <Card className="flex-1 border-border overflow-hidden">
                <CardContent className="p-4 h-full flex flex-col">
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                <Zap className="w-12 h-12 mb-4 opacity-50" />
                                <p className="text-lg font-medium">Start a conversation</p>
                                <p className="text-sm">Test Groq LLaMA 3.3 70B with RAG retrieval</p>
                            </div>
                        ) : (
                            messages.map((message, index) => (
                                <div
                                    key={index}
                                    className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'
                                        }`}
                                >
                                    {message.role === 'assistant' && (
                                        <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center shrink-0">
                                            <Bot className="w-4 h-4 text-orange-500" />
                                        </div>
                                    )}

                                    <div className={`max-w-[70%] ${message.role === 'user'
                                        ? 'bg-accent text-accent-foreground'
                                        : 'bg-muted'
                                        } rounded-lg p-3`}>
                                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                                        {/* Metrics for assistant messages */}
                                        {message.role === 'assistant' && message.duration && (
                                            <div className="mt-2 pt-2 border-t border-border/50 flex items-center gap-3 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    Total: {message.duration.toFixed(2)}s
                                                </span>
                                                {message.apiDuration && (
                                                    <span className="flex items-center gap-1">
                                                        <Zap className="w-3 h-3 text-orange-500" />
                                                        API: {message.apiDuration.toFixed(3)}s
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {/* Sources */}
                                        {message.sources && message.sources.length > 0 && (
                                            <div className="mt-2 pt-2 border-t border-border/50">
                                                <p className="text-xs text-muted-foreground mb-1">
                                                    Sources ({message.sources.length}):
                                                </p>
                                                <div className="flex flex-wrap gap-1">
                                                    {message.sources.slice(0, 3).map((source, i) => (
                                                        <Badge
                                                            key={i}
                                                            variant={getScoreBadgeVariant(source.similarity_score)}
                                                            className="text-xs gap-1"
                                                        >
                                                            <FileText className="w-3 h-3" />
                                                            {source.title.substring(0, 20)}...
                                                            ({(source.similarity_score * 100).toFixed(0)}%)
                                                        </Badge>
                                                    ))}
                                                    {message.sources.length > 3 && (
                                                        <Badge variant="outline" className="text-xs">
                                                            +{message.sources.length - 3} more
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {message.role === 'user' && (
                                        <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center shrink-0">
                                            <User className="w-4 h-4" />
                                        </div>
                                    )}
                                </div>
                            ))
                        )}

                        {/* Loading indicator */}
                        {isLoading && (
                            <div className="flex gap-3">
                                <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                                    <Bot className="w-4 h-4 text-orange-500" />
                                </div>
                                <div className="bg-muted rounded-lg p-3">
                                    <Skeleton className="h-4 w-48 mb-2" />
                                    <Skeleton className="h-4 w-32" />
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="pt-4 border-t border-border mt-4">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Type your message..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                disabled={isLoading || isHealthy === false}
                                className="flex-1"
                            />
                            <Button
                                onClick={sendMessage}
                                disabled={!input.trim() || isLoading || isHealthy === false}
                                className="gap-2 bg-orange-500 hover:bg-orange-600"
                            >
                                {isLoading ? (
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Send className="w-4 h-4" />
                                )}
                                Send
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 text-center">
                            Model: {modelInfo} | Provider: Groq | Endpoint: /chat
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default GroqChat;
