import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Divider,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import StarIcon from '@mui/icons-material/Star';
import {
  useRecordContext,
  SelectInput,
  DateTimeInput,
  ReferenceInput,
  AutocompleteInput,
  SaveButton,
  DeleteButton,
  useResourceContext,
} from 'react-admin';
import { formatDistanceToNow } from 'date-fns';
import { WorkflowButton } from './WorkflowButton.tsx';

const statusChoices = [
  { id: 'draft', name: 'Draft' },
  { id: 'review', name: 'In Review' },
  { id: 'scheduled', name: 'Scheduled' },
  { id: 'published', name: 'Published' },
  { id: 'archived', name: 'Archived' },
];

const statusColors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  draft: 'default',
  review: 'info',
  scheduled: 'warning',
  published: 'success',
  archived: 'error',
};

function formatDateWithRelative(date: string | Date | undefined): string | null {
  if (!date) return null;
  const d = new Date(date);
  const formatted = d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  const relative = formatDistanceToNow(d, { addSuffix: true });
  return `${formatted} (${relative})`;
}

interface EditSidebarProps {
  resource?: string;
}

/**
 * Sidebar for edit forms with save button and publication options.
 */
export function EditSidebar({ resource: resourceProp }: EditSidebarProps) {
  const record = useRecordContext();
  const resourceFromContext = useResourceContext();
  const resource = resourceProp ?? resourceFromContext;

  if (!record) {
    return null;
  }

  const status = record.status as string | undefined;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Primary Actions */}
      <Card variant="outlined">
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <StarIcon fontSize="small" color="primary" />
            <Typography variant="subtitle2" fontWeight="bold">
              Primary Actions
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            <SaveButton />
            <WorkflowButton resource={resource} />
          </Box>

          {status && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Current status:
              </Typography>
              <Chip
                label={status.charAt(0).toUpperCase() + status.slice(1)}
                color={statusColors[status] ?? 'default'}
                size="small"
              />
            </Box>
          )}

          {record.updatedAt && (
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
              Modified: {formatDateWithRelative(record.updatedAt)}
            </Typography>
          )}

          <Divider sx={{ my: 1 }} />

          <Box sx={{ mt: 1 }}>
            <DeleteButton />
          </Box>
        </CardContent>
      </Card>

      {/* Options - always show for workflow-aware content */}
      <Card variant="outlined">
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <SettingsIcon fontSize="small" />
            <Typography variant="subtitle2" fontWeight="bold">
              Options
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <SelectInput
              source="status"
              choices={statusChoices}
              label="Status"
              fullWidth
              helperText={false}
              size="small"
            />

            <DateTimeInput
              source="publishedAt"
              label="Published at"
              fullWidth
              helperText={false}
              size="small"
            />

            <DateTimeInput
              source="depublishedAt"
              label="Depublished at"
              fullWidth
              helperText={false}
              size="small"
            />

            {resource === 'posts' && (
              <ReferenceInput source="author" reference="users">
                <AutocompleteInput
                  label="Author"
                  optionText="email"
                  fullWidth
                  helperText={false}
                  size="small"
                />
              </ReferenceInput>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Metadata */}
      <Card variant="outlined">
        <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
            {record.createdAt && (
              <Typography variant="caption" color="text.secondary">
                <strong>Created:</strong> {formatDateWithRelative(record.createdAt)}
              </Typography>
            )}
            {record.updatedAt && (
              <Typography variant="caption" color="text.secondary">
                <strong>Modified:</strong> {formatDateWithRelative(record.updatedAt)}
              </Typography>
            )}
            {record.id && (
              <Typography variant="caption" color="text.secondary">
                <strong>ID:</strong> {String(record.id)}
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
