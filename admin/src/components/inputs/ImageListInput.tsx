import { useInput, useNotify } from 'react-admin';
import { useState, useCallback } from 'react';
import {
  Box,
  Button,
  IconButton,
  Typography,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  CircularProgress,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import DeleteIcon from '@mui/icons-material/Delete';
import { MediaBrowser } from './MediaBrowser.tsx';

interface ImageListInputProps {
  source: string;
  label?: string;
  helperText?: string;
  isRequired?: boolean;
  min?: number;
  max?: number;
}

interface ImageItem {
  iri: string;
  url?: string;
  thumbnailUrl?: string;
  originalFilename?: string;
}

export function ImageListInput({
  source,
  label,
  helperText,
  isRequired,
  min,
  max,
}: ImageListInputProps) {
  const {
    field,
    fieldState: { error },
  } = useInput({ source });

  const notify = useNotify();
  const [uploading, setUploading] = useState(false);
  const [browserOpen, setBrowserOpen] = useState(false);
  const [items, setItems] = useState<ImageItem[]>([]);

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
        const newIris = [...currentIris, newIri];
        field.onChange(newIris);
        setItems((prev) => [
          ...prev,
          {
            iri: newIri,
            url: media.url,
            thumbnailUrl: media.thumbnailUrl,
            originalFilename: media.originalFilename,
          },
        ]);
        notify('Image uploaded successfully', { type: 'success' });
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
    (media: { '@id': string; url?: string; thumbnailUrl?: string; originalFilename?: string }) => {
      const newIri = media['@id'];
      if (currentIris.includes(newIri)) return;

      const newIris = [...currentIris, newIri];
      field.onChange(newIris);
      setItems((prev) => [
        ...prev,
        {
          iri: newIri,
          url: media.url,
          thumbnailUrl: media.thumbnailUrl,
          originalFilename: media.originalFilename,
        },
      ]);
      setBrowserOpen(false);
    },
    [field, currentIris],
  );

  const handleRemove = useCallback(
    (iri: string) => {
      const newIris = currentIris.filter((i) => i !== iri);
      field.onChange(newIris);
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
        <ImageList cols={4} rowHeight={120} sx={{ mb: 1 }}>
          {items.map((item) => (
            <ImageListItem key={item.iri}>
              <img
                src={item.thumbnailUrl || item.url || ''}
                alt={item.originalFilename ?? ''}
                style={{ objectFit: 'contain', height: '100%', backgroundColor: '#f5f5f5' }}
              />
              <ImageListItemBar
                actionIcon={
                  <IconButton size="small" sx={{ color: 'white' }} onClick={() => handleRemove(item.iri)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                }
              />
            </ImageListItem>
          ))}
        </ImageList>
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
            <input type="file" hidden accept="image/*" onChange={handleUpload} />
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<PhotoLibraryIcon />}
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
        mimeTypeFilter="image/"
      />
    </Box>
  );
}
