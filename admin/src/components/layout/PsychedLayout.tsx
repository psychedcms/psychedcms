import { Layout, type LayoutProps } from 'react-admin';

import { PsychedMenu } from './PsychedMenu.tsx';
import { PsychedAppBar } from './PsychedAppBar.tsx';

/**
 * Custom layout component that extends React Admin's Layout.
 * Uses PsychedMenu for the sidebar and PsychedAppBar with locale toggle.
 */
export function PsychedLayout(props: LayoutProps) {
  return <Layout {...props} menu={PsychedMenu} appBar={PsychedAppBar} />;
}
