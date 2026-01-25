import { useMemo } from 'react';
import { MenuItemLink, useResourceDefinitions, useSidebarState } from 'react-admin';
import { Box, Typography, Divider } from '@mui/material';

import { useContentTypes } from '../../hooks/index.ts';
import { MenuIcon } from './MenuIcon.tsx';

/**
 * Custom menu component that separates resources into two sections:
 * - Content: Resources with ContentType metadata (e.g., Posts, Pages)
 * - Admin: Resources without ContentType metadata (e.g., Users, Settings)
 */
export function PsychedMenu() {
  const [open] = useSidebarState();
  const resources = useResourceDefinitions();
  const contentTypes = useContentTypes();

  const contentTypeNames = useMemo(
    () => new Set(contentTypes.map((ct) => ct.name)),
    [contentTypes]
  );

  const contentTypeMap = useMemo(
    () => new Map(contentTypes.map((ct) => [ct.name, ct])),
    [contentTypes]
  );

  const { contentResources, adminResources } = useMemo(() => {
    const content: string[] = [];
    const admin: string[] = [];

    Object.keys(resources).forEach((resourceName) => {
      if (contentTypeNames.has(resourceName)) {
        content.push(resourceName);
      } else {
        admin.push(resourceName);
      }
    });

    return {
      contentResources: content,
      adminResources: admin,
    };
  }, [resources, contentTypeNames]);

  return (
    <Box
      sx={{
        width: open ? 240 : 50,
        marginTop: 1,
        marginBottom: 1,
        transition: (theme) =>
          theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
      }}
    >
      {contentResources.length > 0 && (
        <>
          <SectionHeader title="Content" open={open} />
          {contentResources.map((resourceName) => {
            const ct = contentTypeMap.get(resourceName);
            return (
              <MenuItemLink
                key={resourceName}
                to={`/${resourceName}`}
                primaryText={ct?.contentType?.name ?? resourceName}
                leftIcon={<MenuIcon name={ct?.contentType?.icon ?? null} />}
              />
            );
          })}
        </>
      )}

      {adminResources.length > 0 && (
        <>
          {contentResources.length > 0 && <Divider sx={{ my: 1 }} />}
          <SectionHeader title="Admin" open={open} />
          {adminResources.map((resourceName) => (
            <MenuItemLink
              key={resourceName}
              to={`/${resourceName}`}
              primaryText={capitalize(resourceName)}
              leftIcon={<MenuIcon name={getAdminIcon(resourceName)} />}
            />
          ))}
        </>
      )}
    </Box>
  );
}

function SectionHeader({ title, open }: { title: string; open: boolean }) {
  if (!open) {
    return null;
  }

  return (
    <Typography
      variant="overline"
      sx={{
        display: 'block',
        px: 2,
        py: 1,
        color: 'text.secondary',
        fontWeight: 600,
      }}
    >
      {title}
    </Typography>
  );
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getAdminIcon(resourceName: string): string {
  const iconMap: Record<string, string> = {
    users: 'People',
    settings: 'Settings',
    roles: 'Security',
    permissions: 'Lock',
  };
  return iconMap[resourceName] ?? 'Settings';
}
