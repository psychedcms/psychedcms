import { type ComponentType, useMemo } from 'react';
import * as MuiIcons from '@mui/icons-material';
import type { SvgIconProps } from '@mui/material';

interface MenuIconProps {
  name: string | null | undefined;
  fontSize?: SvgIconProps['fontSize'];
}

type IconComponentType = ComponentType<SvgIconProps>;

const iconCache = new Map<string, IconComponentType>();

const FALLBACK_ICON_NAME = 'Description';

/**
 * Dynamically renders a Material UI icon by name.
 * Uses Description icon as fallback for missing/invalid names.
 */
export function MenuIcon({ name, fontSize = 'small' }: MenuIconProps) {
  const { IconComponent, resolvedName } = useMemo(() => {
    if (!name) {
      return { IconComponent: MuiIcons.Description, resolvedName: FALLBACK_ICON_NAME };
    }

    const cached = iconCache.get(name);
    if (cached) {
      return { IconComponent: cached, resolvedName: name };
    }

    const icon = (MuiIcons as Record<string, IconComponentType>)[name];
    if (icon) {
      iconCache.set(name, icon);
      return { IconComponent: icon, resolvedName: name };
    }

    return { IconComponent: MuiIcons.Description, resolvedName: FALLBACK_ICON_NAME };
  }, [name]);

  return <IconComponent fontSize={fontSize} data-testid={`${resolvedName}Icon`} />;
}
