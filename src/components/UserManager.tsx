/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Edit, Plus, UserCheck, UserX } from 'lucide-react';
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchUsers, createUser, updateUser, deleteUser } from '@/store/authSlice';
import { type User as UserType, type UserCreate, type UserUpdate } from '@/types/auth';

export function UserManager() {
  const dispatch = useAppDispatch();
  const { user: currentUser } = useAppSelector((state) => state.auth);
  
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserType | null>(null);

  // Form states
  const [createForm, setCreateForm] = useState<UserCreate>({
    username: '',
    password: '',
  });
  const [editForm, setEditForm] = useState<UserUpdate>({
    username: '',
    password: '',
    is_active: true,
  });

  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      const result = await dispatch(fetchUsers()).unwrap();
      setUsers(result);
    } catch (error) {
      toast.error('Failed to fetch users, please refresh the page');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const handleCreateUser = async () => {
    if (!createForm.username || !createForm.password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await dispatch(createUser(createForm)).unwrap();
      toast.success('User created successfully');
      setIsCreateDialogOpen(false);
      setCreateForm({ username: '', password: '' });
      fetchAllUsers();
    } catch (error) {
      toast.error(error as string);
    }
  };

  const handleEditUser = async () => {
    if (!editingUser) return;

    try {
      await dispatch(updateUser({ 
        userId: editingUser.id, 
        userData: editForm 
      })).unwrap();
      toast.success('User updated successfully');
      setIsEditDialogOpen(false);
      setEditingUser(null);
      setEditForm({ username: '', password: '', is_active: true });
      fetchAllUsers();
    } catch (error) {
      toast.error(error as string);
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;

    try {
      await dispatch(deleteUser(deletingUser.id)).unwrap();
      toast.success('User deleted successfully');
      setIsDeleteDialogOpen(false);
      setDeletingUser(null);
      fetchAllUsers();
    } catch (error) {
      toast.error(error as string);
    }
  };

  const openEditDialog = (user: UserType) => {
    setEditingUser(user);
    setEditForm({
      username: user.username,
      password: '',
      is_active: user.is_active,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (user: UserType) => {
    setDeletingUser(user);
    setIsDeleteDialogOpen(true);
  };

  if (loading) {
    return <div>Loading users...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">User Management</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add New User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Add a new user to the system
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="create-username">Username</Label>
                <Input
                  id="create-username"
                  value={createForm.username}
                  onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                  placeholder="Enter username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-password">Password</Label>
                <Input
                  id="create-password"
                  type="password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  placeholder="Enter password"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateUser}>
                  Create User
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {users.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No users found</p>
            </CardContent>
          </Card>
        ) : (
          users.map((user) => (
            <Card key={user.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${
                      user.is_active ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {user.is_active ? (
                        <UserCheck className="w-4 h-4" />
                      ) : (
                        <UserX className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {user.username}
                        {currentUser?.id === user.id && (
                          <Badge variant="outline" className="text-xs">You</Badge>
                        )}
                      </CardTitle>
                      <CardDescription>
                        Created: {new Date(user.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={user.is_active ? "default" : "secondary"}>
                      {user.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(user)}
                        title="Edit user"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      {currentUser?.id !== user.id && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDeleteDialog(user)}
                          title="Delete user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-username">Username</Label>
                <Input
                  id="edit-username"
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  placeholder="Enter username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-password">New Password (leave empty to keep current)</Label>
                <Input
                  id="edit-password"
                  type="password"
                  value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  placeholder="Enter new password"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-active"
                  checked={editForm.is_active}
                  onCheckedChange={(checked) => setEditForm({ ...editForm, is_active: checked as boolean })}
                />
                <Label htmlFor="edit-active">Active user</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleEditUser}>
                  Update User
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {deletingUser && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-red-800">
                  <strong>User:</strong> {deletingUser.username}
                </p>
                <p className="text-sm text-red-600 mt-1">
                  This will permanently delete the user account.
                </p>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteUser}>
                  Delete User
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}