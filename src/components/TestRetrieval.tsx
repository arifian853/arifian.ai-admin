import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import {
    Search,
    Play,
    Plus,
    Trash2,
    Clock,
    FileText,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Zap,
    BarChart3,
    RefreshCw,
    Download
} from 'lucide-react';
import { toast } from 'sonner';

interface RetrievalResult {
    title: string;
    score: number;
    content_preview: string;
}

interface TestResult {
    query: string;
    results_count: number;
    results: RetrievalResult[];
    duration_seconds: number;
    config: {
        limit: number;
        min_similarity: number;
    };
    status: 'success' | 'error' | 'pending';
    error?: string;
    timestamp: Date;
}

interface TestScenario {
    id: string;
    query: string;
    expectedMatch?: string;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:7860';

// Default test scenarios
const DEFAULT_SCENARIOS: TestScenario[] = [
    { id: '1', query: 'siapa Arifian?', expectedMatch: 'Arifian' },
    { id: '2', query: 'apakah Arifian masih kuliah?', expectedMatch: 'kuliah' },
    { id: '3', query: 'apa pekerjaan Arifian?', expectedMatch: 'pekerjaan' },
    { id: '4', query: 'what is AI?', expectedMatch: 'AI' },
    { id: '5', query: 'machine learning', expectedMatch: 'learning' },
];

export const TestRetrieval = () => {
    const [scenarios, setScenarios] = useState<TestScenario[]>(DEFAULT_SCENARIOS);
    const [results, setResults] = useState<Map<string, TestResult>>(new Map());
    const [newQuery, setNewQuery] = useState('');
    const [singleQuery, setSingleQuery] = useState('');
    const [singleResult, setSingleResult] = useState<TestResult | null>(null);
    const [isRunningAll, setIsRunningAll] = useState(false);
    const [isRunningSingle, setIsRunningSingle] = useState(false);
    const [progress, setProgress] = useState(0);

    // Calculate metrics
    const completedTests = Array.from(results.values()).filter(r => r.status !== 'pending');
    const successfulTests = completedTests.filter(r => r.status === 'success' && r.results_count > 0);
    const failedTests = completedTests.filter(r => r.status === 'error' || r.results_count === 0);
    const avgDuration = completedTests.length > 0
        ? completedTests.reduce((sum, r) => sum + r.duration_seconds, 0) / completedTests.length
        : 0;
    const avgScore = successfulTests.length > 0
        ? successfulTests.reduce((sum, r) => sum + (r.results[0]?.score || 0), 0) / successfulTests.length
        : 0;

    const runSingleTest = async (query: string): Promise<TestResult> => {
        const startTime = Date.now();
        try {
            const response = await fetch(
                `${BACKEND_URL}/chat/test-retrieval?query=${encodeURIComponent(query)}`
            );

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();

            return {
                query,
                results_count: data.results_count,
                results: data.results,
                duration_seconds: data.duration_seconds,
                config: data.config,
                status: 'success',
                timestamp: new Date()
            };
        } catch (error: any) {
            return {
                query,
                results_count: 0,
                results: [],
                duration_seconds: (Date.now() - startTime) / 1000,
                config: { limit: 5, min_similarity: 0.25 },
                status: 'error',
                error: error.message,
                timestamp: new Date()
            };
        }
    };

    const handleRunSingle = async () => {
        if (!singleQuery.trim()) {
            toast.error('Please enter a query');
            return;
        }

        setIsRunningSingle(true);
        setSingleResult(null);

        try {
            const result = await runSingleTest(singleQuery);
            setSingleResult(result);

            if (result.status === 'success') {
                toast.success(`Found ${result.results_count} results in ${result.duration_seconds.toFixed(3)}s`);
            } else {
                toast.error(`Test failed: ${result.error}`);
            }
        } catch (error) {
            toast.error('Failed to run test');
        }

        setIsRunningSingle(false);
    };

    const handleRunAll = async () => {
        setIsRunningAll(true);
        setProgress(0);
        const newResults = new Map<string, TestResult>();

        for (let i = 0; i < scenarios.length; i++) {
            const scenario = scenarios[i];
            const result = await runSingleTest(scenario.query);
            newResults.set(scenario.id, result);
            setResults(new Map(newResults));
            setProgress(((i + 1) / scenarios.length) * 100);
        }

        setIsRunningAll(false);
        toast.success(`Completed ${scenarios.length} tests`);
    };

    const handleAddScenario = () => {
        if (!newQuery.trim()) {
            toast.error('Please enter a query');
            return;
        }

        const newScenario: TestScenario = {
            id: Date.now().toString(),
            query: newQuery.trim()
        };

        setScenarios([...scenarios, newScenario]);
        setNewQuery('');
        toast.success('Scenario added');
    };

    const handleRemoveScenario = (id: string) => {
        setScenarios(scenarios.filter(s => s.id !== id));
        const newResults = new Map(results);
        newResults.delete(id);
        setResults(newResults);
    };

    const getScoreColor = (score: number) => {
        if (score >= 0.5) return 'text-green-500';
        if (score >= 0.35) return 'text-yellow-500';
        return 'text-red-500';
    };

    const getScoreBadgeVariant = (score: number): 'default' | 'secondary' | 'destructive' => {
        if (score >= 0.5) return 'default';
        if (score >= 0.35) return 'secondary';
        return 'destructive';
    };

    const exportResults = () => {
        const data = {
            timestamp: new Date().toISOString(),
            metrics: {
                total_tests: completedTests.length,
                successful: successfulTests.length,
                failed: failedTests.length,
                avg_duration: avgDuration,
                avg_score: avgScore
            },
            results: Array.from(results.entries()).map(([id, result]) => ({
                scenario_id: id,
                ...result
            }))
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `retrieval-test-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Results exported');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Test Retrieval</h2>
                    <p className="text-muted-foreground">Test and analyze document retrieval performance</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={exportResults}
                        variant="outline"
                        disabled={completedTests.length === 0}
                        className="gap-2"
                    >
                        <Download className="w-4 h-4" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Single Query Test */}
            <Card className="border-border">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Zap className="w-5 h-5 text-accent" />
                        Quick Test
                    </CardTitle>
                    <CardDescription>Run a single retrieval query</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2">
                        <Input
                            placeholder="Enter your test query..."
                            value={singleQuery}
                            onChange={(e) => setSingleQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleRunSingle()}
                            className="flex-1"
                        />
                        <Button
                            onClick={handleRunSingle}
                            disabled={isRunningSingle}
                            className="gap-2"
                        >
                            {isRunningSingle ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                                <Search className="w-4 h-4" />
                            )}
                            Test
                        </Button>
                    </div>

                    {/* Single Result */}
                    {singleResult && (
                        <div className="mt-4 p-4 bg-accent/5 border border-border space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {singleResult.status === 'success' && singleResult.results_count > 0 ? (
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                    ) : singleResult.status === 'error' ? (
                                        <XCircle className="w-5 h-5 text-red-500" />
                                    ) : (
                                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                                    )}
                                    <span className="font-medium text-foreground">
                                        {singleResult.results_count} results found
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Clock className="w-4 h-4" />
                                    {singleResult.duration_seconds.toFixed(3)}s
                                </div>
                            </div>

                            {singleResult.results.length > 0 && (
                                <div className="space-y-2">
                                    {singleResult.results.map((result, i) => (
                                        <div key={i} className="p-3 bg-background border border-border">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="w-4 h-4 text-accent" />
                                                        <span className="font-medium text-foreground text-sm">
                                                            {result.title}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                        {result.content_preview}
                                                    </p>
                                                </div>
                                                <Badge variant={getScoreBadgeVariant(result.score)}>
                                                    {(result.score * 100).toFixed(1)}%
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Metrics Dashboard */}
            {completedTests.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="border-border">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-accent/20 flex items-center justify-center">
                                    <BarChart3 className="w-5 h-5 text-accent" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-foreground">{completedTests.length}</p>
                                    <p className="text-xs text-muted-foreground">Total Tests</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-500/20 flex items-center justify-center">
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-foreground">{successfulTests.length}</p>
                                    <p className="text-xs text-muted-foreground">With Results</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-500/20 flex items-center justify-center">
                                    <Clock className="w-5 h-5 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-foreground">{avgDuration.toFixed(2)}s</p>
                                    <p className="text-xs text-muted-foreground">Avg Duration</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-500/20 flex items-center justify-center">
                                    <Zap className="w-5 h-5 text-purple-500" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-foreground">{(avgScore * 100).toFixed(1)}%</p>
                                    <p className="text-xs text-muted-foreground">Avg Top Score</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Batch Test Scenarios */}
            <Card className="border-border">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Play className="w-5 h-5 text-accent" />
                                Test Scenarios
                            </CardTitle>
                            <CardDescription>Batch test multiple queries</CardDescription>
                        </div>
                        <Button
                            onClick={handleRunAll}
                            disabled={isRunningAll || scenarios.length === 0}
                            className="gap-2"
                        >
                            {isRunningAll ? (
                                <>
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    Running...
                                </>
                            ) : (
                                <>
                                    <Play className="w-4 h-4" />
                                    Run All ({scenarios.length})
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Progress Bar */}
                    {isRunningAll && (
                        <Progress value={progress} className="mt-4" />
                    )}
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Add New Scenario */}
                    <div className="flex gap-2">
                        <Input
                            placeholder="Add new test query..."
                            value={newQuery}
                            onChange={(e) => setNewQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddScenario()}
                            className="flex-1"
                        />
                        <Button onClick={handleAddScenario} variant="outline" className="gap-2">
                            <Plus className="w-4 h-4" />
                            Add
                        </Button>
                    </div>

                    {/* Scenarios List */}
                    <div className="space-y-2">
                        {scenarios.map((scenario) => {
                            const result = results.get(scenario.id);
                            return (
                                <div
                                    key={scenario.id}
                                    className="p-3 bg-accent/5 border border-border flex items-center gap-3"
                                >
                                    {/* Status Icon */}
                                    <div className="w-8 h-8 flex items-center justify-center">
                                        {!result ? (
                                            <div className="w-3 h-3 rounded-full bg-muted" />
                                        ) : result.status === 'success' && result.results_count > 0 ? (
                                            <CheckCircle className="w-5 h-5 text-green-500" />
                                        ) : result.status === 'error' ? (
                                            <XCircle className="w-5 h-5 text-red-500" />
                                        ) : (
                                            <AlertTriangle className="w-5 h-5 text-yellow-500" />
                                        )}
                                    </div>

                                    {/* Query */}
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-foreground">{scenario.query}</p>
                                        {result && result.status === 'success' && result.results.length > 0 && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Top: {result.results[0].title} ({(result.results[0].score * 100).toFixed(1)}%)
                                            </p>
                                        )}
                                    </div>

                                    {/* Metrics */}
                                    {result && (
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="text-xs">
                                                {result.results_count} docs
                                            </Badge>
                                            <Badge variant="outline" className="text-xs">
                                                {result.duration_seconds.toFixed(3)}s
                                            </Badge>
                                            {result.results[0] && (
                                                <Badge variant={getScoreBadgeVariant(result.results[0].score)}>
                                                    {(result.results[0].score * 100).toFixed(1)}%
                                                </Badge>
                                            )}
                                        </div>
                                    )}

                                    {/* Remove Button */}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleRemoveScenario(scenario.id)}
                                        className="text-muted-foreground hover:text-destructive"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default TestRetrieval;
