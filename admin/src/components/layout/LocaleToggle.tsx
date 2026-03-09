import { useLocaleState } from 'react-admin';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';

import { useLocaleSettings } from '../../hooks/useLocaleSettings.ts';
import { useEditLocale } from '../../providers/EditLocaleContext.tsx';

/**
 * Language toggle for the app bar.
 * Switches both react-admin UI language and the editing locale simultaneously.
 */
export function LocaleToggle() {
  const [raLocale, setRaLocale] = useLocaleState();
  const { setLocale: setEditLocale } = useEditLocale();
  const { supportedLocales } = useLocaleSettings();

  const handleChange = (_: React.MouseEvent<HTMLElement>, newLocale: string | null) => {
    if (newLocale && newLocale !== raLocale) {
      setRaLocale(newLocale);
      setEditLocale(newLocale);
    }
  };

  return (
    <ToggleButtonGroup
      value={raLocale}
      exclusive
      onChange={handleChange}
      size="small"
      sx={{
        mr: 1,
        '& .MuiToggleButton-root': {
          color: 'inherit',
          borderColor: 'rgba(255,255,255,0.3)',
          textTransform: 'uppercase',
          fontSize: '0.75rem',
          py: 0.25,
          px: 1,
          '&.Mui-selected': {
            bgcolor: 'rgba(255,255,255,0.15)',
            color: 'inherit',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' },
          },
        },
      }}
    >
      {supportedLocales.map((loc) => (
        <ToggleButton key={loc} value={loc}>
          {loc}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
