import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useSidebarState, useTranslate } from 'react-admin';
import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

import { SettingsMenuSlot, getSettingsPages } from '@psychedcms/admin-core';

/**
 * Collapsible settings menu with plugin-contributed sub-items.
 * Auto-expands when the current route is under /settings/.
 */
export function SettingsMenu() {
  const location = useLocation();
  const [sidebarOpen] = useSidebarState();
  const translate = useTranslate();

  const pages = getSettingsPages();
  const settingsPaths = pages.map((p) => `/settings/${p.path}`);
  const isActive = settingsPaths.some((p) => location.pathname.startsWith(p));
  const [open, setOpen] = useState(isActive);

  return (
    <List component="nav" disablePadding>
      <ListItemButton
        onClick={() => setOpen(!open)}
        sx={{
          minHeight: 40,
          px: sidebarOpen ? 2 : 1.5,
          color: isActive ? 'primary.main' : 'text.secondary',
        }}
      >
        <ListItemIcon sx={{ minWidth: sidebarOpen ? 40 : 'auto', color: 'inherit' }}>
          <SettingsIcon fontSize="small" />
        </ListItemIcon>
        {sidebarOpen && (
          <>
            <ListItemText
              primary={translate('psyched.menu.settings', { _: 'Settings' })}
              primaryTypographyProps={{ fontSize: '0.875rem' }}
            />
            {open ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
          </>
        )}
      </ListItemButton>

      <Collapse in={open && sidebarOpen} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <SettingsMenuSlot />
        </List>
      </Collapse>
    </List>
  );
}
