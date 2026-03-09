import { useState } from 'react';
import { useNotify } from 'react-admin';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Button,
} from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import SaveIcon from '@mui/icons-material/Save';

import { useLocaleSettings } from '../../hooks/useLocaleSettings.ts';

const entrypoint = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

async function saveDefaultLocale(defaultLocale: string): Promise<void> {
  const response = await fetch(`${entrypoint}/locale-settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ defaultLocale }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Save failed' }));
    throw new Error(error.error ?? 'Save failed');
  }
}

/**
 * Global Settings page — manage the default locale.
 * Supported locales are configured via APP_LOCALES env var (read-only here).
 * Default locale is stored in the database and editable.
 */
export function GlobalSettings() {
  const { defaultLocale, supportedLocales, reload } = useLocaleSettings();
  const notify = useNotify();

  const [selectedDefault, setSelectedDefault] = useState(defaultLocale);
  const [saving, setSaving] = useState(false);

  const hasChanges = selectedDefault !== defaultLocale;

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveDefaultLocale(selectedDefault);
      reload();
      notify('Default locale saved', { type: 'success' });
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Failed to save', { type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mt: 2 }}>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        Global Settings
      </Typography>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <LanguageIcon />
            <Typography variant="h6">Locales</Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Available Languages
            </Typography>
            <Stack direction="row" spacing={1}>
              {supportedLocales.map((loc) => (
                <Chip
                  key={loc}
                  label={loc.toUpperCase()}
                  variant={loc === selectedDefault ? 'filled' : 'outlined'}
                  color={loc === selectedDefault ? 'primary' : 'default'}
                />
              ))}
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              Configured via <code>APP_LOCALES</code> environment variable
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Default Language
            </Typography>
            <ToggleButtonGroup
              value={selectedDefault}
              exclusive
              onChange={(_, value) => {
                if (value) setSelectedDefault(value);
              }}
              size="small"
            >
              {supportedLocales.map((loc) => (
                <ToggleButton key={loc} value={loc} sx={{ textTransform: 'uppercase', px: 2 }}>
                  {loc}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>

          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={!hasChanges || saving}
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
