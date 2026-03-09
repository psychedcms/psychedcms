import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
} from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';

import { useLocaleSettings } from '../../hooks/useLocaleSettings.ts';

/**
 * Global Settings page — displays app-wide locale configuration.
 * Currently read-only from the API; locale config is set via environment variables.
 * Provides a clear view of current settings and guidance on how to change them.
 */
export function GlobalSettings() {
  const { defaultLocale, supportedLocales } = useLocaleSettings();

  return (
    <Box sx={{ maxWidth: 800, mt: 2 }}>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        Global Settings
      </Typography>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <LanguageIcon />
            <Typography variant="h6">Locales</Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Default Locale
            </Typography>
            <Chip
              label={defaultLocale.toUpperCase()}
              color="primary"
              sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Supported Locales
            </Typography>
            <Stack direction="row" spacing={1}>
              {supportedLocales.map((loc) => (
                <Chip
                  key={loc}
                  label={loc.toUpperCase()}
                  variant={loc === defaultLocale ? 'filled' : 'outlined'}
                  color={loc === defaultLocale ? 'primary' : 'default'}
                />
              ))}
            </Stack>
          </Box>

          <Typography variant="body2" color="text.secondary">
            Locale settings are configured via environment variables{' '}
            <code>APP_DEFAULT_LOCALE</code> and <code>APP_LOCALES</code>.
            Changes require an application restart.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
