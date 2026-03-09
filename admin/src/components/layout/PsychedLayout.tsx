import { Layout, useLocaleState, type LayoutProps } from 'react-admin';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/fr';
import 'dayjs/locale/en';

import { PsychedMenu } from './PsychedMenu.tsx';
import { PsychedAppBar } from './PsychedAppBar.tsx';

/**
 * Custom layout component that extends React Admin's Layout.
 * Uses PsychedMenu for the sidebar and PsychedAppBar with locale toggle.
 * Wraps with LocalizationProvider so all MUI date pickers follow the UI locale.
 */
export function PsychedLayout(props: LayoutProps) {
  const [locale] = useLocaleState();

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={locale}>
      <Layout {...props} menu={PsychedMenu} appBar={PsychedAppBar} />
    </LocalizationProvider>
  );
}
