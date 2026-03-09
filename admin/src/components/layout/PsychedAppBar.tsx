import { AppBar, type AppBarProps } from 'react-admin';

import { LocaleToggle } from './LocaleToggle.tsx';

/**
 * Custom AppBar with locale toggle.
 */
export function PsychedAppBar(props: AppBarProps) {
  return (
    <AppBar {...props}>
      <LocaleToggle />
    </AppBar>
  );
}
