/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trash2, Eye, Download, Upload, ExternalLink } from 'lucide-react';
import { toast } from "sonner";
import FileUpload from './FileUpload';
import { apiRequest } from '@/lib/utils';

interface FileItem {
  _id: string;
  filename: string;
  original_filename: string;
  cloudinary_url: string;
  file_type: string;
  file_size: number;
  upload_date: string;
  knowledge_ids: string[];
}

const API_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

export function FileManager() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewingFile, setViewingFile] = useState<FileItem | null>(null);
  const [deletingFile, setDeletingFile] = useState<FileItem | null>(null);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const data = await apiRequest('/files/');
      setFiles(data);
    } catch (error) {
      toast.error("Failed to fetch files, please refresh the page");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFile = async () => {
    if (!deletingFile) return;

    setIsDeleting(true);
    try {
      await apiRequest(`/files/${deletingFile._id}`, {
        method: 'DELETE',
      });

      toast.success("File deleted successfully");
      setIsDeleteDialogOpen(false);
      setDeletingFile(null);
      fetchFiles();
    } catch (error) {
      toast.error("Failed to delete file");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownload = async (file: FileItem) => {
    try {
      if (file.file_type.toLowerCase() === 'pdf') {
        // Use custom PDF endpoint for base64 PDFs
        const pdfUrl = `${API_BASE_URL}/files/${file._id}/pdf`;
        window.open(pdfUrl, '_blank');
      } else {
        // Use regular Cloudinary URL for other files
        window.open(file.cloudinary_url, '_blank');
      }
    } catch (error) {
      toast.error("Failed to download file");
    }
  };


  const openViewDialog = (file: FileItem) => {
    setViewingFile(file);
    setIsViewDialogOpen(true);
  };

  const openDeleteDialog = (file: FileItem) => {
    setDeletingFile(file);
    setIsDeleteDialogOpen(true);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const renderFilePreview = (file: FileItem) => {
    if (file.file_type.toLowerCase() === 'pdf') {
      const pdfUrl = `${API_BASE_URL}/files/${file._id}/pdf`;

      return (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">PDF Preview</h4>
            <Badge variant="secondary">
              Base64 Storage
            </Badge>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <iframe
              src={pdfUrl}
              width="100%"
              height="500px"
              title="PDF Preview"
              className="border-0"
              onError={() => {
                toast.error("PDF preview failed. Try downloading the file.");
              }}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={() => handleDownload(file)}>
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open(pdfUrl, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open in New Tab
            </Button>
          </div>

          <div className="text-sm text-muted bg-blue-50 p-3 rounded-lg">
            <strong>Note:</strong> This PDF is stored as encoded text to bypass cloud storage restrictions.
            The content has been processed and is available for chat. | This PDF has been processed for text extraction.
            If it's a scanned document and chat responses are limited, try the "OCR Reprocess" button above.
          </div>
        </div>
      );
    } else if (file.file_type.toLowerCase() === 'csv') {
      return (
        <div className="space-y-4">
          <h4 className="font-medium">CSV File</h4>
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              CSV files contain tabular data. This file has been processed and converted to knowledge entries.
            </p>
            <Button
              size="sm"
              className="mt-2"
              onClick={() => window.open(file.cloudinary_url, '_blank')}
            >
              <Download className="w-4 h-4 mr-2" />
              Download CSV
            </Button>
          </div>
        </div>
      );
    } else if (file.file_type.toLowerCase() === 'xlsx' || file.file_type.toLowerCase() === 'xls') {
      return (
        <div className="space-y-4">
          <h4 className="font-medium">Excel File</h4>
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              Excel files contain spreadsheet data. This file has been processed and converted to knowledge entries.
            </p>
            <Button
              size="sm"
              className="mt-2"
              onClick={() => window.open(file.cloudinary_url, '_blank')}
            >
              <Download className="w-4 h-4 mr-2" />
              Download Excel
            </Button>
          </div>
        </div>
      );
    } else {
      return (
        <div className="space-y-4">
          <h4 className="font-medium">File Preview</h4>
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              Preview not available for this file type. You can download the file to view it.
            </p>
            <Button
              size="sm"
              className="mt-2"
              onClick={() => window.open(file.cloudinary_url, '_blank')}
            >
              <Download className="w-4 h-4 mr-2" />
              Download File
            </Button>
          </div>
        </div>
      );
    }
  };

  if (loading) {
    return <div>Loading files...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">File Management</h2>
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="w-4 h-4 mr-2" />
              Upload New File
            </Button>
          </DialogTrigger>
          <DialogContent className='min-w-6xl'>
            <FileUpload
              onUploadSuccess={() => {
                setIsUploadDialogOpen(false);
                fetchFiles();
                toast.success("File uploaded successfully!");
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {files.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No files uploaded yet</p>
            </CardContent>
          </Card>
        ) : (
          files.map((file) => (
            <Card key={file._id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {file.original_filename}
                      <Badge variant="secondary" className="uppercase">
                        {file.file_type}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Size: {formatFileSize(file.file_size)} •
                      Uploaded: {formatDate(file.upload_date)} •
                      Knowledge entries: {file.knowledge_ids.length}
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openViewDialog(file)}
                      title="View file details and preview"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownload(file)}
                      title="Download file"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openDeleteDialog(file)}
                      title="Delete file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="min-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 pr-8">
              <span className="truncate max-w-[400px]" title={viewingFile?.original_filename}>
                {viewingFile?.original_filename}
              </span>
              <Badge variant="secondary" className="uppercase shrink-0">
                {viewingFile?.file_type}
              </Badge>
            </DialogTitle>
            <DialogDescription>
              File details and preview
            </DialogDescription>
          </DialogHeader>
          {viewingFile && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 p-4 bg-muted rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <strong>Original Filename:</strong>
                    <div className="text-sm text-muted-foreground break-all mt-1">
                      {viewingFile.original_filename}
                    </div>
                  </div>
                  <div>
                    <strong>File Type:</strong>
                    <div className="text-sm text-muted-foreground mt-1">
                      {viewingFile.file_type.toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <strong>File Size:</strong>
                    <div className="text-sm text-muted-foreground mt-1">
                      {formatFileSize(viewingFile.file_size)}
                    </div>
                  </div>
                  <div>
                    <strong>Upload Date:</strong>
                    <div className="text-sm text-muted-foreground mt-1">
                      {formatDate(viewingFile.upload_date)}
                    </div>
                  </div>
                  <div>
                    <strong>Knowledge Entries:</strong>
                    <div className="text-sm text-muted-foreground mt-1">
                      {viewingFile.knowledge_ids.length}
                    </div>
                  </div>
                  <div>
                    <strong>Cloudinary URL:</strong>
                    <div className="text-sm mt-1">
                      <a
                        href={viewingFile.cloudinary_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline break-all"
                        title={viewingFile.cloudinary_url}
                      >
                        {viewingFile.cloudinary_url.length > 50 
                          ? `${viewingFile.cloudinary_url.substring(0, 50)}...`
                          : viewingFile.cloudinary_url
                        }
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {renderFilePreview(viewingFile)}

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setIsViewDialogOpen(false)}
                >
                  Close
                </Button>
                <Button onClick={() => handleDownload(viewingFile)}>
                  <Download className="w-4 h-4 mr-2" />
                  Download File
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
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deletingFile?.original_filename}"?
              The file will be permanently removed from storage, but any knowledge entries created from this file will remain intact.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteFile}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}