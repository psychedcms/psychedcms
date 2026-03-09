import { useInput, useNotify } from 'react-admin';
import { useState, useCallback } from 'react';
import {
  Box,
  Button,
  IconButton,
  Typography,
  CircularProgress,
  Paper,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import DeleteIcon from '@mui/icons-material/Delete';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { MediaBrowser } from './MediaBrowser.tsx';

interface FileInputProps {
  source: string;
  label?: string;
  helperText?: string;
  isRequired?: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileInput({
  source,
  label,
  helperText,
  isRequired,
}: FileInputProps) {
  const {
    field,
    fieldState: { error },
  } = useInput({ source });

  const notify = useNotify();

  const [uploading, setUploading] = useState(false);
  const [browserOpen, setBrowserOpen] = useState(false);
  const [fileInfo, setFileInfo] = useState<{
    originalFilename?: string;
    mimeType?: string;
    size?: number;
  } | null>(null);

  const handleUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/media`,
          {
            method: 'POST',
            body: formData,
          },
        );

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }

        const media = await response.json();
        field.onChange(media['@id']);
        setFileInfo({
          originalFilename: media.originalFilename,
          mimeType: media.mimeType,
          size: media.size,
        });
        notify('File uploaded successfully', { type: 'success' });
      } catch (err) {
        notify(
          `Upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
          { type: 'error' },
        );
      } finally {
        setUploading(false);
      }
    },
    [field, notify],
  );

  const handleBrowseSelect = useCallback(
    (media: Record<string, any>) => {
      field.onChange(media['@id']);
      setFileInfo({
        originalFilename: media.originalFilename,
        mimeType: media.mimeType,
        size: media.size,
      });
      setBrowserOpen(false);
    },
    [field],
  );

  const handleRemove = useCallback(() => {
    field.onChange(null);
    setFileInfo(null);
  }, [field]);

  const hasValue = field.value != null && field.value !== '';

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="caption" color="textSecondary" sx={{ mb: 1, display: 'block' }}>
        {label ?? source}
        {isRequired && ' *'}
      </Typography>

      {hasValue && fileInfo ? (
        <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, maxWidth: 400 }}>
          <InsertDriveFileIcon color="action" sx={{ fontSize: 40 }} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" noWrap>
              {fileInfo.originalFilename ?? 'File'}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {fileInfo.mimeType}
              {fileInfo.size ? ` - ${formatFileSize(fileInfo.size)}` : ''}
            </Typography>
          </Box>
          <IconButton size="small" color="error" onClick={handleRemove}>
            <DeleteIcon />
          </IconButton>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            component="label"
            startIcon={uploading ? <CircularProgress size={16} /> : <CloudUploadIcon />}
            disabled={uploading}
          >
            Upload
            <input type="file" hidden onChange={handleUpload} />
          </Button>
          <Button
            variant="outlined"
            startIcon={<FolderOpenIcon />}
            onClick={() => setBrowserOpen(true)}
          >
            Browse
          </Button>
        </Box>
      )}

      {error && (
        <Typography variant="caption" color="error">
          {error.message}
        </Typography>
      )}
      {helperText && !error && (
        <Typography variant="caption" color="textSecondary">
          {helperText}
        </Typography>
      )}

      <MediaBrowser
        open={browserOpen}
        onClose={() => setBrowserOpen(false)}
        onSelect={handleBrowseSelect}
      />
    </Box>
  );
}
