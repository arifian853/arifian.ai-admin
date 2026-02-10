import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { KnowledgeList } from '@/components/KnowledgeList';
import { AddKnowledge } from '@/components/AddKnowledge';
import { SystemPromptManager } from '@/components/SystemPromptManager';
import { FileManager } from '@/components/FileManager';
import { UserManager } from '@/components/UserManager';
import GroqChat from '@/components/GroqChat';
import FileUpload from '@/components/FileUpload';
import RagConfig from '@/components/RagConfig';
import TestRetrieval from '@/components/TestRetrieval';
import {
    LogOut,
    User,
    BookOpen,
    MessageSquare,
    FolderOpen,
    Upload,
    Plus,
    Settings,
    Users,
    Mail,
    Sparkles,
    Cpu,
    FlaskConical
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { logout } from '@/store/authSlice';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Confessions from '@/components/Confessions';

const menuItems = [
    { id: 'view', label: 'View Knowledge', icon: BookOpen },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'test-retrieval', label: 'Test Retrieval', icon: FlaskConical },
    { id: 'rag-config', label: 'RAG Config', icon: Cpu },
    { id: 'files', label: 'File Manager', icon: FolderOpen },
    { id: 'upload', label: 'Upload File', icon: Upload },
    { id: 'add', label: 'Add Knowledge', icon: Plus },
    { id: 'prompts', label: 'System Prompts', icon: Settings },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'confessions', label: 'Confessions', icon: Mail },
];

export const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('view');
    const [refreshKey, setRefreshKey] = useState(0);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { user } = useAppSelector((state) => state.auth);

    const handleKnowledgeAdded = () => {
        setRefreshKey(prev => prev + 1);
    };

    const handleRefresh = () => {
        setRefreshKey(prev => prev + 1);
    };

    const handleLogout = () => {
        dispatch(logout());
        toast.success('Logged out successfully');
        navigate('/');
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'view':
                return <KnowledgeList key={refreshKey} onRefresh={handleRefresh} />;
            case 'chat':
                return <GroqChat />;
            case 'test-retrieval':
                return <TestRetrieval />;
            case 'rag-config':
                return <RagConfig />;
            case 'files':
                return <FileManager />;
            case 'upload':
                return <FileUpload onUploadSuccess={handleKnowledgeAdded} />;
            case 'add':
                return <AddKnowledge onKnowledgeAdded={handleKnowledgeAdded} />;
            case 'prompts':
                return <SystemPromptManager />;
            case 'users':
                return <UserManager />;
            case 'confessions':
                return <Confessions />;
            default:
                return <KnowledgeList key={refreshKey} onRefresh={handleRefresh} />;
        }
    };

    const activeMenuItem = menuItems.find(item => item.id === activeTab);

    return (
        <div className="min-h-screen bg-background flex">
            {/* Sidebar */}
            <aside className="w-64 min-h-screen bg-card border-r border-border flex flex-col">
                {/* Logo / Brand */}
                <div className="p-6 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-accent flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-accent-foreground" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-foreground">Arifian.AI</h1>
                            <p className="text-xs text-muted-foreground">Admin Panel</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4">
                    <div className="space-y-1">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all ${isActive
                                        ? 'bg-accent text-accent-foreground'
                                        : 'text-muted-foreground hover:bg-accent/10 hover:text-foreground'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {item.label}
                                </button>
                            );
                        })}
                    </div>
                </nav>

                {/* User Info & Logout */}
                <div className="p-4 border-t border-border">
                    <div className="flex items-center gap-3 px-4 py-3 bg-background/50">
                        <div className="w-8 h-8 bg-accent/20 flex items-center justify-center">
                            <User className="w-4 h-4 text-accent" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                                {user?.username}
                            </p>
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                Online
                            </Badge>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLogout}
                        className="w-full mt-2 justify-start gap-3 text-muted-foreground hover:text-destructive"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-h-screen">
                {/* Header */}
                <header className="h-16 border-b border-border bg-card/50 flex items-center px-8">
                    <div className="flex items-center gap-3">
                        {activeMenuItem && (
                            <>
                                <activeMenuItem.icon className="w-5 h-5 text-accent" />
                                <h2 className="text-xl font-semibold text-foreground">
                                    {activeMenuItem.label}
                                </h2>
                            </>
                        )}
                    </div>

                    {/* Decorative element */}
                    <div className="ml-auto flex items-center gap-2">
                        <div className="w-2 h-2 bg-accent animate-pulse"></div>
                        <span className="text-xs text-muted-foreground">System Active</span>
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 p-8 overflow-auto">
                    {/* Decorative corner ornaments */}
                    <div className="relative">
                        {/* Top-left ornament */}
                        <div className="absolute -top-4 -left-4 w-8 h-8 border-l-2 border-t-2 border-accent/30"></div>
                        {/* Top-right ornament */}
                        <div className="absolute -top-4 -right-4 w-8 h-8 border-r-2 border-t-2 border-accent/30"></div>

                        {/* Content */}
                        <div className="relative">
                            {renderContent()}
                        </div>

                        {/* Bottom-left ornament */}
                        <div className="absolute -bottom-4 -left-4 w-8 h-8 border-l-2 border-b-2 border-accent/30"></div>
                        {/* Bottom-right ornament */}
                        <div className="absolute -bottom-4 -right-4 w-8 h-8 border-r-2 border-b-2 border-accent/30"></div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="h-12 border-t border-border bg-card/30 flex items-center justify-center px-8">
                    <p className="text-xs text-muted-foreground">
                        © 2026 Arifian.AI — Personal Knowledge Management System
                    </p>
                </footer>
            </main>
        </div>
    );
};
