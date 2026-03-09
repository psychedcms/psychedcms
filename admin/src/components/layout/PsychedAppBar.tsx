import { AppBar, type AppBarProps } from 'react-admin';
import { Box } from '@mui/material';

import { LocaleToggle } from './LocaleToggle.tsx';

/**
 * Custom AppBar with locale toggle right-aligned.
 */
export function PsychedAppBar(props: AppBarProps) {
  return (
    <AppBar {...props}>
      <Box sx={{ flex: 1 }} />
      <LocaleToggle />
    </AppBar>
  );
}
