/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Trash2, Edit, Plus, Check, Eye } from 'lucide-react';
import { toast } from "sonner"
import { apiRequest } from '@/lib/utils';

interface SystemPrompt {
  _id: string;
  name: string;
  prompt: string;
  is_active: boolean;
  is_default?: boolean;
  description?: string;
  created_at?: number;
}

interface SystemPromptFormData {
  name: string;
  prompt: string;
  description: string;
  is_active: boolean;
  is_default: boolean;
}

export function SystemPromptManager() {
  const [prompts, setPrompts] = useState<SystemPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<SystemPrompt | null>(null);
  const [viewingPrompt, setViewingPrompt] = useState<SystemPrompt | null>(null);
  const [deletingPrompt, setDeletingPrompt] = useState<SystemPrompt | null>(null);
  const [formData, setFormData] = useState<SystemPromptFormData>({
    name: '',
    prompt: '',
    description: '',
    is_active: false,
    is_default: false
  });

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      const data = await apiRequest('/system-prompts/');
      // Sort prompts: active first, then default, then others
      const sortedPrompts = data.sort((a: SystemPrompt, b: SystemPrompt) => {
        // Active prompt always first
        if (a.is_active && !b.is_active) return -1;
        if (!a.is_active && b.is_active) return 1;
        
        // If both active or both inactive, default comes next
        if (a.is_default && !b.is_default) return -1;
        if (!a.is_default && b.is_default) return 1;
        
        // If same priority, sort by name
        return a.name.localeCompare(b.name);
      });
      
      setPrompts(sortedPrompts);
    } catch (error) {
      toast.error("Failed to fetch system prompts, please refresh the page");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePrompt = async () => {
    try {
      await apiRequest('/system-prompts/', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      toast.success("System prompt created successfully");
      setIsCreateDialogOpen(false);
      resetForm();
      fetchPrompts();
    } catch (error) {
      toast.error("Failed to create system prompt");
    }
  };

  const handleUpdatePrompt = async () => {
    if (!editingPrompt) return;

    try {
      await apiRequest(`/system-prompts/${editingPrompt._id}`, {
        method: 'PUT',
        body: JSON.stringify(formData),
      });

      toast.success("System prompt updated successfully");
      setIsEditDialogOpen(false);
      setEditingPrompt(null);
      resetForm();
      fetchPrompts();
    } catch (error) {
      toast.error("Failed to update system prompt");
    }
  };

  const handleDeletePrompt = async () => {
    if (!deletingPrompt) return;

    try {
      await apiRequest(`/system-prompts/${deletingPrompt._id}`, {
        method: 'DELETE',
      });

      toast.success("System prompt deleted successfully");
      setIsDeleteDialogOpen(false);
      setDeletingPrompt(null);
      fetchPrompts();
    } catch (error) {
      toast.error("Failed to delete system prompt");
    }
  };

  const handleActivatePrompt = async (id: string) => {
    try {
      await apiRequest(`/system-prompts/${id}/activate`, {
        method: 'POST',
      });

      toast.success("System prompt activated successfully");
      fetchPrompts();
    } catch (error) {
      toast.error("Failed to activate system prompt");
    }
  };

  const handleResetToDefault = async () => {
    try {
      await apiRequest('/system-prompts/reset-to-default', {
        method: 'POST',
      });

      toast.success("Reset to default prompt successfully");
      fetchPrompts();
    } catch (error) {
      toast.error("Failed to reset to default prompt");
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      prompt: '',
      description: '',
      is_active: false,
      is_default: false
    });
  };

  const openEditDialog = (prompt: SystemPrompt) => {
    setEditingPrompt(prompt);
    setFormData({
      name: prompt.name,
      prompt: prompt.prompt,
      description: prompt.description || '',
      is_active: prompt.is_active,
      is_default: prompt.is_default || false
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (prompt: SystemPrompt) => {
    setViewingPrompt(prompt);
    setIsViewDialogOpen(true);
  };

  const openDeleteDialog = (prompt: SystemPrompt) => {
    if (prompt.is_default) {
      toast.error("Cannot delete default prompt");
      return;
    }
    setDeletingPrompt(prompt);
    setIsDeleteDialogOpen(true);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">System Prompt Management</h2>
          <p className="text-sm text-muted-foreground font-medium">
            You may need to delete entire chat to use the new system prompt. <br /> 
            Click "reset to default" button if you see no default prompt / any prompt.
          </p>
        </div>
       
        <div className="flex space-x-2">
          <Button onClick={handleResetToDefault} variant="outline">
            Reset to Default
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add New Prompt
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New System Prompt</DialogTitle>
                <DialogDescription>
                  Create a new system prompt for your chatbot.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter prompt name"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter prompt description"
                  />
                </div>
                <div>
                  <Label htmlFor="prompt">System Prompt</Label>
                  <Textarea
                    id="prompt"
                    value={formData.prompt}
                    onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                    placeholder="Enter your system prompt here..."
                    rows={8}
                    className="max-h-60 overflow-y-auto resize-none"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                  <Label htmlFor="is_active">Set as active prompt</Label>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreatePrompt}>Create Prompt</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4">
        {prompts.map((prompt, index) => (
          <Card key={prompt._id} className={`${prompt.is_active ? 'border-green-500 bg-green-50/30' : ''} ${index === 0 && prompt.is_active ? 'ring-2 ring-green-200' : ''}`}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {prompt.name}
                    {prompt.is_active && (
                      <Badge variant="default" className="bg-green-500">
                        Active
                      </Badge>
                    )}
                    {prompt.is_default && (
                      <Badge variant="secondary" className="bg-blue-500 text-white">
                        Default
                      </Badge>
                    )}
                    {index === 0 && prompt.is_active && (
                      <Badge variant="outline" className="border-green-500 text-green-500">
                        Currently Used
                      </Badge>
                    )}
                  </CardTitle>
                  {prompt.description && (
                    <CardDescription>{prompt.description}</CardDescription>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openViewDialog(prompt)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  {!prompt.is_active && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleActivatePrompt(prompt._id)}
                      className="border-green-500 text-green-700 hover:bg-green-50"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Activate
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditDialog(prompt)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openDeleteDialog(prompt)}
                    disabled={prompt.is_default}
                    title={prompt.is_default ? "Cannot delete default prompt" : "Delete prompt"}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-3 rounded-md">
                <pre className="whitespace-pre-wrap text-sm">
                  {prompt.prompt.length > 300 
                    ? `${prompt.prompt.substring(0, 300)}...` 
                    : prompt.prompt
                  }
                </pre>
              </div>
              {prompt.is_default && (
                <div className="mt-2 text-sm text-muted-foreground">
                  <strong>Note:</strong> This is the default system prompt. It can be edited but cannot be deleted.
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit System Prompt</DialogTitle>
            <DialogDescription>
              Modify the system prompt settings.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter prompt name"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description (Optional)</Label>
              <Input
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter prompt description"
              />
            </div>
            <div>
              <Label htmlFor="edit-prompt">System Prompt</Label>
              <Textarea
                id="edit-prompt"
                value={formData.prompt}
                onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                placeholder="Enter your system prompt here..."
                rows={8}
                className="max-h-60 overflow-y-auto resize-none"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              />
              <Label htmlFor="edit-is_active">Set as active prompt</Label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdatePrompt}>Update Prompt</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="min-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {viewingPrompt?.name}
              {viewingPrompt?.is_active && (
                <Badge variant="default" className="bg-green-500">
                  Active
                </Badge>
              )}
              {viewingPrompt?.is_default && (
                <Badge variant="secondary" className="bg-blue-500 text-white">
                  Default
                </Badge>
              )}
            </DialogTitle>
            {viewingPrompt?.description && (
              <DialogDescription>{viewingPrompt.description}</DialogDescription>
            )}
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className='mb-4'>System Prompt Content:</Label>
              <div className="bg-muted p-4 rounded-md max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm">
                  {viewingPrompt?.prompt}
                </pre>
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setIsViewDialogOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the system prompt "{deletingPrompt?.name}"? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeletePrompt}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}