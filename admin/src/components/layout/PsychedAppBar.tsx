import { AppBar, type AppBarProps } from 'react-admin';
import { Box } from '@mui/material';

import { AppBarSlot } from '@psychedcms/admin-core';

/**
 * Custom AppBar with plugin-contributed items right-aligned.
 */
export function PsychedAppBar(props: AppBarProps) {
  return (
    <AppBar {...props}>
      <Box sx={{ flex: 1 }} />
      <AppBarSlot />
    </AppBar>
  );
}
