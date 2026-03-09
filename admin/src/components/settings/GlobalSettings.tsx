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
  TextField,
  Button,
  IconButton,
} from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';

import { useLocaleSettings, type LocaleSettings } from '../../hooks/useLocaleSettings.ts';

const entrypoint = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

async function saveLocaleSettings(settings: LocaleSettings): Promise<LocaleSettings> {
  const response = await fetch(`${entrypoint}/locale-settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Save failed' }));
    throw new Error(error.error ?? 'Save failed');
  }

  return response.json();
}

/**
 * Global Settings page — manage app-wide locale configuration.
 * Default locale and supported locales are stored in the database.
 */
export function GlobalSettings() {
  const { defaultLocale, supportedLocales, reload } = useLocaleSettings();
  const notify = useNotify();

  const [selectedDefault, setSelectedDefault] = useState(defaultLocale);
  const [locales, setLocales] = useState<string[]>(supportedLocales);
  const [newLocale, setNewLocale] = useState('');
  const [saving, setSaving] = useState(false);

  const hasChanges =
    selectedDefault !== defaultLocale ||
    JSON.stringify(locales) !== JSON.stringify(supportedLocales);

  const handleAddLocale = () => {
    const code = newLocale.trim().toLowerCase();
    if (code && code.length >= 2 && code.length <= 5 && !locales.includes(code)) {
      setLocales([...locales, code]);
      setNewLocale('');
    }
  };

  const handleRemoveLocale = (loc: string) => {
    const updated = locales.filter((l) => l !== loc);
    if (updated.length === 0) return;
    setLocales(updated);
    if (selectedDefault === loc) {
      setSelectedDefault(updated[0]);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await saveLocaleSettings({
        defaultLocale: selectedDefault,
        supportedLocales: locales,
      });
      setSelectedDefault(result.defaultLocale);
      setLocales(result.supportedLocales);
      reload();
      notify('Locale settings saved', { type: 'success' });
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
              Supported Locales
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap', gap: 1 }}>
              {locales.map((loc) => (
                <Chip
                  key={loc}
                  label={loc.toUpperCase()}
                  variant={loc === selectedDefault ? 'filled' : 'outlined'}
                  color={loc === selectedDefault ? 'primary' : 'default'}
                  onDelete={locales.length > 1 ? () => handleRemoveLocale(loc) : undefined}
                  deleteIcon={<CloseIcon fontSize="small" />}
                />
              ))}
            </Stack>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              <TextField
                size="small"
                placeholder="e.g. de"
                value={newLocale}
                onChange={(e) => setNewLocale(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddLocale()}
                slotProps={{ htmlInput: { maxLength: 5 } }}
                sx={{ width: 100 }}
              />
              <IconButton
                size="small"
                onClick={handleAddLocale}
                disabled={!newLocale.trim() || newLocale.trim().length < 2}
              >
                <AddIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Default Locale
            </Typography>
            <ToggleButtonGroup
              value={selectedDefault}
              exclusive
              onChange={(_, value) => {
                if (value) setSelectedDefault(value);
              }}
              size="small"
            >
              {locales.map((loc) => (
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
