'use client';

import { useState, useRef } from 'react';
import {
  Paperclip, Image as ImageIcon, FileText, File, 
  Download, Trash2, Eye, Upload, Check,
  FileSpreadsheet, FileType, ExternalLink, MoreVertical
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface FileAttachment {
  id: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedBy: {
    id: number;
    name: string;
    avatar?: string;
  };
  uploadedAt: Date;
  url?: string;
}

interface FileAttachmentsProps {
  attachments: FileAttachment[];
  onUpload: (file: File) => Promise<void>;
  onDelete: (attachmentId: number) => Promise<void>;
  onDownload: (attachmentId: number) => Promise<void>;
  className?: string;
}

const fileTypeIcons: Record<string, React.ReactNode> = {
  'image': <ImageIcon className="h-5 w-5" />,
  'pdf': <FileText className="h-5 w-5" />,
  'document': <FileText className="h-5 w-5" />,
  'spreadsheet': <FileSpreadsheet className="h-5 w-5" />,
  'presentation': <FileType className="h-5 w-5" />,
  'default': <File className="h-5 w-5" />,
};

const fileTypeColors: Record<string, string> = {
  'image': 'bg-blue-500/10 text-blue-500',
  'pdf': 'bg-red-500/10 text-red-500',
  'document': 'bg-blue-500/10 text-blue-500',
  'spreadsheet': 'bg-green-500/10 text-green-500',
  'presentation': 'bg-amber-500/10 text-amber-500',
  'default': 'bg-gray-500/10 text-gray-500',
};

const getFileType = (fileName: string, fileType: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  
  if (fileType.startsWith('image/')) return 'image';
  if (fileType === 'application/pdf') return 'pdf';
  if (fileType.includes('document') || extension.match(/^(docx?|txt|rtf)$/)) return 'document';
  if (fileType.includes('spreadsheet') || extension.match(/^(xlsx?|csv)$/)) return 'spreadsheet';
  if (fileType.includes('presentation') || extension === 'pptx') return 'presentation';
  
  return 'default';
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export function FileAttachments({
  attachments,
  onUpload,
  onDelete,
  onDownload,
  className,
}: FileAttachmentsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await processFile(file);
  };

  const processFile = async (file: File) => {
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    
    if (file.size > maxFileSize) {
      toast.error(`File too large. Maximum size is ${formatFileSize(maxFileSize)}`);
      return;
    }

    setSelectedFile(file);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      await onUpload(file);

      clearInterval(interval);
      setUploadProgress(100);

      toast.success(`${file.name} uploaded successfully`);
      
      // Reset after successful upload
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 1000);

    } catch (error) {
      toast.error('Failed to upload file');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (attachmentId: number) => {
    if (confirm('Are you sure you want to delete this file?')) {
      try {
        await onDelete(attachmentId);
        toast.success('File deleted');
      } catch (error) {
        toast.error('Failed to delete file');
      }
    }
  };

  const handleDownload = async (attachmentId: number) => {
    try {
      await onDownload(attachmentId);
    } catch (error) {
      toast.error('Failed to download file');
    }
  };

  const getFileIcon = (attachment: FileAttachment) => {
    const fileType = getFileType(attachment.fileName, attachment.fileType);
    return fileTypeIcons[fileType] || fileTypeIcons.default;
  };

  const getFileColor = (attachment: FileAttachment) => {
    const fileType = getFileType(attachment.fileName, attachment.fileType);
    return fileTypeColors[fileType] || fileTypeColors.default;
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Paperclip className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold">Files</h3>
          <Badge variant="outline" className="ml-2">
            {attachments.length}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleFileSelect}
            disabled={isUploading}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept="image/*,application/pdf,text/*,application/*"
          />
        </div>
      </div>

      {/* Upload progress */}
      {isUploading && selectedFile && (
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              'h-10 w-10 rounded-lg flex items-center justify-center',
              getFileColor({ fileName: selectedFile.name, fileType: selectedFile.type } as FileAttachment)
            )}>
              {getFileIcon({ fileName: selectedFile.name, fileType: selectedFile.type } as FileAttachment)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                <span className="text-xs text-muted-foreground">
                  {formatFileSize(selectedFile.size)}
                </span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-muted-foreground">
                  {uploadProgress < 100 ? 'Uploading...' : 'Upload complete!'}
                </span>
                <span className="text-xs font-medium">{uploadProgress}%</span>
              </div>
            </div>
            {uploadProgress === 100 && (
              <Check className="h-5 w-5 text-green-500" />
            )}
          </div>
        </Card>
      )}

      {/* Files list */}
      <div className="space-y-3">
        {attachments.map((attachment) => {
          const fileType = getFileType(attachment.fileName, attachment.fileType);
          const fileColor = getFileColor(attachment);
          const fileIcon = getFileIcon(attachment);

          return (
            <Card key={attachment.id} className="p-4 hover:bg-muted/30 transition-colors">
              <div className="flex items-start gap-3">
                {/* File icon */}
                <div className={cn(
                  'h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0',
                  fileColor
                )}>
                  {fileIcon}
                </div>

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <h4 className="font-medium truncate">{attachment.fileName}</h4>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge variant="outline" className="text-xs">
                          {fileType}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatFileSize(attachment.fileSize)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          • Uploaded {formatDistanceToNow(attachment.uploadedAt, { addSuffix: true })}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          • by {attachment.uploadedBy.name}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleDownload(attachment.id)}>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        {attachment.url && (
                          <DropdownMenuItem onClick={() => window.open(attachment.url, '_blank')}>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Open in new tab
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          onClick={() => handleDelete(attachment.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Quick actions */}
                  <div className="flex items-center gap-2 mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(attachment.id)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Empty state */}
      {attachments.length === 0 && !isUploading && (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <Paperclip className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-2">No files attached</h3>
          <p className="text-muted-foreground max-w-sm mx-auto mb-6">
            Upload images, documents, or any other files related to this task.
          </p>
          <Button onClick={handleFileSelect}>
            <Upload className="h-4 w-4 mr-2" />
            Upload your first file
          </Button>
        </div>
      )}
    </div>
  );
}
