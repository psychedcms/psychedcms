import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useSidebarState } from 'react-admin';
import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import PublicIcon from '@mui/icons-material/Public';
import TuneIcon from '@mui/icons-material/Tune';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

const SETTINGS_PATHS = ['/settings/global', '/settings/preferences'];

/**
 * Collapsible settings menu with Global and Preferences sub-items.
 * Auto-expands when the current route is under /settings/.
 */
export function SettingsMenu() {
  const location = useLocation();
  const [sidebarOpen] = useSidebarState();
  const isActive = SETTINGS_PATHS.some((p) => location.pathname.startsWith(p));
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
              primary="Settings"
              primaryTypographyProps={{ fontSize: '0.875rem' }}
            />
            {open ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
          </>
        )}
      </ListItemButton>

      <Collapse in={open && sidebarOpen} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <SettingsSubItem
            to="/settings/global"
            label="Global"
            icon={<PublicIcon fontSize="small" />}
            active={location.pathname === '/settings/global'}
          />
          <SettingsSubItem
            to="/settings/preferences"
            label="Preferences"
            icon={<TuneIcon fontSize="small" />}
            active={location.pathname === '/settings/preferences'}
          />
        </List>
      </Collapse>
    </List>
  );
}

function SettingsSubItem({
  to,
  label,
  icon,
  active,
}: {
  to: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
}) {
  return (
    <ListItemButton
      component={Link}
      to={to}
      sx={{
        pl: 4,
        minHeight: 36,
        color: active ? 'primary.main' : 'text.primary',
        bgcolor: active ? 'action.selected' : 'transparent',
        '&:hover': { bgcolor: 'action.hover' },
      }}
    >
      <ListItemIcon sx={{ minWidth: 32, color: 'inherit' }}>
        {icon}
      </ListItemIcon>
      <ListItemText
        primary={label}
        primaryTypographyProps={{ fontSize: '0.8125rem' }}
      />
    </ListItemButton>
  );
}
