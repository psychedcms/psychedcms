import { Layout, type LayoutProps } from 'react-admin';

import { PsychedMenu } from './PsychedMenu.tsx';

/**
 * Custom layout component that extends React Admin's Layout.
 * Uses PsychedMenu for the sidebar navigation with two-section structure.
 */
export function PsychedLayout(props: LayoutProps) {
  return <Layout {...props} menu={PsychedMenu} />;
}
