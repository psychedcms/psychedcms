import { useInput, useNotify } from 'react-admin';
import { useState, useCallback } from 'react';
import {
  Box,
  Button,
  IconButton,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Paper,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import DeleteIcon from '@mui/icons-material/Delete';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { MediaBrowser } from './MediaBrowser.tsx';

interface FileListInputProps {
  source: string;
  label?: string;
  helperText?: string;
  isRequired?: boolean;
  min?: number;
  max?: number;
}

interface FileItem {
  iri: string;
  originalFilename?: string;
  mimeType?: string;
  size?: number;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileListInput({
  source,
  label,
  helperText,
  isRequired,
  min,
  max,
}: FileListInputProps) {
  const {
    field,
    fieldState: { error },
  } = useInput({ source });

  const notify = useNotify();
  const [uploading, setUploading] = useState(false);
  const [browserOpen, setBrowserOpen] = useState(false);
  const [items, setItems] = useState<FileItem[]>([]);

  const currentIris: string[] = Array.isArray(field.value) ? field.value : [];
  const canAdd = max == null || currentIris.length < max;

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
          { method: 'POST', body: formData },
        );

        if (!response.ok) throw new Error(`Upload failed: ${response.statusText}`);

        const media = await response.json();
        const newIri = media['@id'];
        field.onChange([...currentIris, newIri]);
        setItems((prev) => [
          ...prev,
          {
            iri: newIri,
            originalFilename: media.originalFilename,
            mimeType: media.mimeType,
            size: media.size,
          },
        ]);
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
    [field, currentIris, notify],
  );

  const handleBrowseSelect = useCallback(
    (media: { '@id': string; originalFilename?: string; mimeType?: string; size?: number }) => {
      const newIri = media['@id'];
      if (currentIris.includes(newIri)) return;

      field.onChange([...currentIris, newIri]);
      setItems((prev) => [
        ...prev,
        {
          iri: newIri,
          originalFilename: media.originalFilename,
          mimeType: media.mimeType,
          size: media.size,
        },
      ]);
      setBrowserOpen(false);
    },
    [field, currentIris],
  );

  const handleRemove = useCallback(
    (iri: string) => {
      field.onChange(currentIris.filter((i) => i !== iri));
      setItems((prev) => prev.filter((item) => item.iri !== iri));
    },
    [field, currentIris],
  );

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="caption" color="textSecondary" sx={{ mb: 1, display: 'block' }}>
        {label ?? source}
        {isRequired && ' *'}
        {min != null || max != null
          ? ` (${min ?? 0}–${max ?? '∞'})`
          : ''}
      </Typography>

      {items.length > 0 && (
        <Paper variant="outlined" sx={{ mb: 1 }}>
          <List dense>
            {items.map((item) => (
              <ListItem
                key={item.iri}
                secondaryAction={
                  <IconButton edge="end" size="small" onClick={() => handleRemove(item.iri)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                }
              >
                <ListItemIcon>
                  <InsertDriveFileIcon />
                </ListItemIcon>
                <ListItemText
                  primary={item.originalFilename ?? 'File'}
                  secondary={
                    [item.mimeType, item.size ? formatFileSize(item.size) : null]
                      .filter(Boolean)
                      .join(' - ')
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {canAdd && (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            component="label"
            startIcon={uploading ? <CircularProgress size={16} /> : <CloudUploadIcon />}
            disabled={uploading}
          >
            Upload
            <input type="file" hidden onChange={handleUpload} />
          </Button>
          <Button
            variant="outlined"
            size="small"
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
