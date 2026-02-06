/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MessageSquare, Trash2, Reply, Eye, CheckCircle, XCircle, Edit, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Confession {
  id: string;
  message: string;
  ipAddress: string;
  reply?: string;
  replyCreatedAt?: string;
  isReplied: boolean;
  createdAt: string;
}

interface Stats {
  total: number;
  replied: number;
  notReplied: number;
}

export default function Confessions() {
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, replied: 0, notReplied: 0 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedConfession, setSelectedConfession] = useState<Confession | null>(null);
  const [replyText, setReplyText] = useState('');
  const [editedMessage, setEditedMessage] = useState('');
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleteReplyDialogOpen, setIsDeleteReplyDialogOpen] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  const API_URL = import.meta.env.VITE_BACKEND_BASE_URL;

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  const fetchConfessions = async () => {
    try {
      setLoading(true);
      let url = `${API_URL}/confessions/`;
      
      if (filter !== 'all') {
        url += `?is_replied=${filter === 'replied'}`;
      }

      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error('Failed to fetch confessions');

      const data = await response.json();
      setConfessions(data);
    } catch (error) {
      toast.error('Failed to load confessions');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/confessions/stats/summary`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error('Failed to fetch stats');

      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchConfessions();
    fetchStats();
  }, [filter]);

  const handleEdit = async () => {
    if (!selectedConfession || !editedMessage.trim()) return;

    try {
      setActionLoading(true);
      const response = await fetch(
        `${API_URL}/confessions/${selectedConfession.id}`,
        {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({ message: editedMessage }),
        }
      );

      if (!response.ok) throw new Error('Failed to update confession');

      toast.success('Confession updated successfully');
      setIsEditDialogOpen(false);
      setEditedMessage('');
      setSelectedConfession(null);
      fetchConfessions();
    } catch (error) {
      toast.error('Failed to update confession');
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReply = async () => {
    if (!selectedConfession || !replyText.trim()) return;

    try {
      setActionLoading(true);
      const response = await fetch(
        `${API_URL}/confessions/${selectedConfession.id}/reply`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ reply: replyText }),
        }
      );

      if (!response.ok) throw new Error('Failed to reply');

      toast.success('Reply sent successfully');
      setIsReplyDialogOpen(false);
      setReplyText('');
      setSelectedConfession(null);
      fetchConfessions();
      fetchStats();
    } catch (error) {
      toast.error('Failed to send reply');
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteReply = async () => {
    if (!selectedConfession) return;

    try {
      setActionLoading(true);
      const response = await fetch(
        `${API_URL}/confessions/${selectedConfession.id}/reply`,
        {
          method: 'DELETE',
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) throw new Error('Failed to delete reply');

      toast.success('Reply deleted successfully');
      setIsDeleteReplyDialogOpen(false);
      setIsViewDialogOpen(false);
      setSelectedConfession(null);
      fetchConfessions();
      fetchStats();
    } catch (error) {
      toast.error('Failed to delete reply');
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedConfession) return;

    try {
      setActionLoading(true);
      const response = await fetch(
        `${API_URL}/confessions/${selectedConfession.id}`,
        {
          method: 'DELETE',
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) throw new Error('Failed to delete confession');

      toast.success('Confession deleted successfully');
      setIsDeleteDialogOpen(false);
      setSelectedConfession(null);
      fetchConfessions();
      fetchStats();
    } catch (error) {
      toast.error('Failed to delete confession');
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  };

  const openEditDialog = (confession: Confession) => {
    setSelectedConfession(confession);
    setEditedMessage(confession.message);
    setIsEditDialogOpen(true);
  };

  const openReplyDialog = (confession: Confession) => {
    setSelectedConfession(confession);
    setReplyText(confession.reply || '');
    setIsReplyDialogOpen(true);
  };

  const openViewDialog = (confession: Confession) => {
    setSelectedConfession(confession);
    setIsViewDialogOpen(true);
  };

  const openDeleteDialog = (confession: Confession) => {
    setSelectedConfession(confession);
    setIsDeleteDialogOpen(true);
  };

  const openDeleteReplyDialog = (confession: Confession) => {
    setSelectedConfession(confession);
    setIsDeleteReplyDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Confessions</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Replied</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.replied}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Not Replied</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.notReplied}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Confessions Management</CardTitle>
              <CardDescription>View and manage user confessions</CardDescription>
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Confessions</SelectItem>
                <SelectItem value="replied">Replied</SelectItem>
                <SelectItem value="not_replied">Not Replied</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : confessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No confessions found
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Message</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {confessions.map((confession) => (
                    <TableRow key={confession.id}>
                      <TableCell className="max-w-md">
                        <div className="truncate">{confession.message}</div>
                      </TableCell>
                      <TableCell>
                        {confession.isReplied ? (
                          <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                            Replied
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Not Replied</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(confession.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openViewDialog(confession)}
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(confession)}
                            title="Edit message"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openReplyDialog(confession)}
                            title={confession.isReplied ? "Edit reply" : "Reply"}
                          >
                            <Reply className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => openDeleteDialog(confession)}
                            title="Delete confession"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Confession Details</DialogTitle>
          </DialogHeader>
          {selectedConfession && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Message</Label>
                <div className="mt-2 rounded-md bg-muted p-3">
                  <p className="text-sm whitespace-pre-wrap">
                    {selectedConfession.message}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">IP Address</Label>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {selectedConfession.ipAddress}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Date</Label>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatDate(selectedConfession.createdAt)}
                  </p>
                </div>
              </div>
              {selectedConfession.isReplied && (
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-sm font-medium">Reply</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openDeleteReplyDialog(selectedConfession)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete Reply
                    </Button>
                  </div>
                  <div className="rounded-md bg-muted dark:bg-green-950 p-3">
                    <p className="text-sm whitespace-pre-wrap">
                      {selectedConfession.reply}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Replied at: {selectedConfession.replyCreatedAt && formatDate(selectedConfession.replyCreatedAt)}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Message Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Confession Message</DialogTitle>
            <DialogDescription>
              Make changes to the confession message. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Type confession message here..."
                value={editedMessage}
                onChange={(e) => setEditedMessage(e.target.value)}
                rows={6}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleEdit} 
              disabled={!editedMessage.trim() || actionLoading}
            >
              {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reply Dialog */}
      <Dialog open={isReplyDialogOpen} onOpenChange={setIsReplyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedConfession?.isReplied ? 'Edit Reply' : 'Reply to Confession'}
            </DialogTitle>
            <DialogDescription>
              {selectedConfession?.message}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reply">Your Reply</Label>
              <Textarea
                id="reply"
                placeholder="Type your reply here..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={5}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsReplyDialogOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleReply} 
              disabled={!replyText.trim() || actionLoading}
            >
              {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {selectedConfession?.isReplied ? 'Update Reply' : 'Send Reply'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Reply Confirmation */}
      <AlertDialog open={isDeleteReplyDialogOpen} onOpenChange={setIsDeleteReplyDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Reply</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this reply? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteReply}
              disabled={actionLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confession Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Confession</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this confession? This action cannot be undone and will permanently remove the confession and its reply.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={actionLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}