import {
  Edit,
  SimpleForm,
  TextInput,
  useRecordContext,
} from 'react-admin';
import { Box, CardMedia, Typography } from '@mui/material';

function MediaPreview() {
  const record = useRecordContext();
  if (!record) return null;

  const isImage = record.mimeType?.startsWith('image/');

  return (
    <Box sx={{ mb: 2 }}>
      {isImage && (record.thumbnailUrl || record.url) ? (
        <CardMedia
          component="img"
          image={record.thumbnailUrl || record.url}
          alt={record.altText ?? ''}
          sx={{ maxHeight: 300, objectFit: 'contain', bgcolor: 'grey.100', borderRadius: 1, mb: 1 }}
        />
      ) : null}
      <Typography variant="body2" color="textSecondary">
        {record.originalFilename} — {record.mimeType}
        {record.width && record.height ? ` — ${record.width}×${record.height}` : ''}
      </Typography>
    </Box>
  );
}

export function MediaEdit() {
  return (
    <Edit>
      <SimpleForm>
        <MediaPreview />
        <TextInput source="title" fullWidth />
        <TextInput source="altText" fullWidth label="Alt Text" />
        <TextInput source="description" multiline rows={3} fullWidth />
      </SimpleForm>
    </Edit>
  );
}
