import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { KnowledgeList } from '@/components/KnowledgeList';
import { AddKnowledge } from '@/components/AddKnowledge';
import { SystemPromptManager } from '@/components/SystemPromptManager';
import { FileManager } from '@/components/FileManager';
import { UserManager } from '@/components/UserManager';
import Chat from '@/components/Chat';
import FileUpload from '@/components/FileUpload';
import { LogOut, User } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { logout } from '@/store/authSlice';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Confessions from '@/components/Confessions';

export const Dashboard = () => {
    const [refreshKey, setRefreshKey] = useState(0);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { user } = useAppSelector((state) => state.auth);

    const handleKnowledgeAdded = () => {
        // Trigger refresh of knowledge list by changing key
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

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                {/* Header with user info and logout */}
                <div className="mb-8 flex justify-between items-start">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">
                            Arifian.AI Admin Panel
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            For managing and organizing my own data.
                        </p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <User className="w-4 h-4" />
                            <span className="text-sm font-medium">{user?.username}</span>
                            <Badge variant="outline" className="text-xs">Online</Badge>
                        </div>
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={handleLogout}
                            className="flex items-center space-x-2"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Logout</span>
                        </Button>
                    </div>
                </div>

                <Tabs defaultValue="view" className="w-full">
                    <TabsList className="grid w-full grid-cols-8 mb-8">
                        <TabsTrigger value="view" className="text-sm font-medium">
                            View Knowledge
                        </TabsTrigger>
                        <TabsTrigger value="chat" className="text-sm font-medium">
                            Chat
                        </TabsTrigger>
                        <TabsTrigger value="files" className="text-sm font-medium">
                            File Manager
                        </TabsTrigger>
                        <TabsTrigger value="upload" className="text-sm font-medium">
                            Upload File
                        </TabsTrigger>
                        <TabsTrigger value="add" className="text-sm font-medium">
                            Add Knowledge
                        </TabsTrigger>
                        <TabsTrigger value="prompts" className="text-sm font-medium">
                            System Prompts
                        </TabsTrigger>
                        <TabsTrigger value="users" className="text-sm font-medium">
                            User Management
                        </TabsTrigger>
                        <TabsTrigger value="confessions" className="text-sm font-medium">
                            Confessions
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="view" className="space-y-4">
                        <KnowledgeList key={refreshKey} onRefresh={handleRefresh} />
                    </TabsContent>

                    <TabsContent value="add" className="space-y-4">
                        <AddKnowledge onKnowledgeAdded={handleKnowledgeAdded} />
                    </TabsContent>

                    <TabsContent value="chat" className="space-y-4">
                        <Chat />
                    </TabsContent>

                    <TabsContent value="files" className="space-y-4">
                        <FileManager />
                    </TabsContent>

                    <TabsContent value="upload" className="space-y-4">
                        <FileUpload onUploadSuccess={handleKnowledgeAdded} />
                    </TabsContent>

                    <TabsContent value="prompts" className="space-y-4">
                        <SystemPromptManager />
                    </TabsContent>

                    <TabsContent value="users" className="space-y-4">
                        <UserManager />
                    </TabsContent>

                    <TabsContent value="confessions" className="space-y-4">
                        <Confessions />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};
