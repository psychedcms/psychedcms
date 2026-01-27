import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
} from '@mui/material';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { StaticDateTimePicker } from '@mui/x-date-pickers/StaticDateTimePicker';
import dayjs, { Dayjs } from 'dayjs';

interface ScheduleDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (scheduledAt: string) => void;
  loading?: boolean;
}

/**
 * Converts a Dayjs object to ISO 8601 ATOM format with timezone offset
 * Format: YYYY-MM-DDTHH:mm:ss+HH:MM (e.g., 2025-01-27T10:00:00+01:00)
 */
function toIso8601Atom(date: Dayjs): string {
  return date.format('YYYY-MM-DDTHH:mm:ssZ');
}

/**
 * Dialog for scheduling content publication.
 * Displays a calendar and time picker with future date validation.
 */
export function ScheduleDialog({ open, onClose, onConfirm, loading }: ScheduleDialogProps) {
  // Default to 1 hour from now, rounded to next 15 minutes
  const defaultDateTime = useMemo(() => {
    const now = dayjs();
    const minutes = now.minute();
    const roundedMinutes = Math.ceil(minutes / 15) * 15;
    return now.add(1, 'hour').minute(roundedMinutes).second(0);
  }, []);

  const [scheduledAt, setScheduledAt] = useState<Dayjs>(defaultDateTime);
  const [error, setError] = useState<string | null>(null);

  const minDateTime = useMemo(() => dayjs(), []);

  const handleConfirm = () => {
    if (scheduledAt.isBefore(dayjs())) {
      setError('Scheduled date must be in the future');
      return;
    }

    setError(null);
    onConfirm(toIso8601Atom(scheduledAt));
  };

  const handleClose = () => {
    setError(null);
    setScheduledAt(defaultDateTime);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ScheduleIcon color="warning" />
        Schedule Publication
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        {error && (
          <Alert severity="error" sx={{ mx: 2, mt: 1 }}>
            {error}
          </Alert>
        )}
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <StaticDateTimePicker
            value={scheduledAt}
            onChange={(newValue) => {
              if (newValue) {
                setScheduledAt(newValue);
                setError(null);
              }
            }}
            minDateTime={minDateTime}
            ampm={false}
            slotProps={{
              actionBar: { actions: [] },
            }}
          />
        </LocalizationProvider>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="warning"
          disabled={loading || !scheduledAt}
        >
          {loading ? 'Scheduling...' : 'Schedule'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
