import { Box } from '@mui/material';
import type { ReactNode } from 'react';

interface TwoColumnLayoutProps {
  main: ReactNode;
  sidebar: ReactNode;
}

/**
 * Two-column layout for edit forms.
 * Main content area on the left (flex), sidebar on the right (fixed width).
 */
export function TwoColumnLayout({ main, sidebar }: TwoColumnLayoutProps) {
  return (
    <Box sx={{ display: 'flex', gap: 3, width: '100%', alignItems: 'flex-start' }}>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {main}
      </Box>
      <Box sx={{ width: 320, flexShrink: 0 }}>
        {sidebar}
      </Box>
    </Box>
  );
}
