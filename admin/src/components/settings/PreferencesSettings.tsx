import { useState } from 'react';
import { useNotify } from 'react-admin';
import {
  Box,
  Card,
  CardContent,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Button,
} from '@mui/material';
import TranslateIcon from '@mui/icons-material/Translate';
import SaveIcon from '@mui/icons-material/Save';

import { useEditLocale } from '../../providers/EditLocaleContext.tsx';
import { useLocaleSettings } from '../../hooks/useLocaleSettings.ts';

/**
 * User Preferences page — allows the user to set their preferred editing locale.
 * The preference is persisted to localStorage (and will sync to user profile when auth is available).
 */
export function PreferencesSettings() {
  const { locale, setLocale } = useEditLocale();
  const { supportedLocales } = useLocaleSettings();
  const notify = useNotify();
  const [selectedLocale, setSelectedLocale] = useState(locale);

  const handleSave = () => {
    setLocale(selectedLocale);
    notify('Preferences saved', { type: 'success' });
  };

  const hasChanges = selectedLocale !== locale;

  return (
    <Box sx={{ maxWidth: 800, mt: 2 }}>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        Preferences
      </Typography>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <TranslateIcon />
            <Typography variant="h6">Language</Typography>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Choose your preferred editing language. This will be used as the default
            locale when editing translatable content.
          </Typography>

          <ToggleButtonGroup
            value={selectedLocale}
            exclusive
            onChange={(_, value) => {
              if (value) setSelectedLocale(value);
            }}
            size="medium"
            sx={{ mb: 3 }}
          >
            {supportedLocales.map((loc) => (
              <ToggleButton
                key={loc}
                value={loc}
                sx={{ textTransform: 'uppercase', px: 3 }}
              >
                {loc}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          <Box>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={!hasChanges}
            >
              Save Preferences
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
