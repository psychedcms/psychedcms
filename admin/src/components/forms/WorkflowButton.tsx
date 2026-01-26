import { useState, useRef } from 'react';
import {
  Button,
  ButtonGroup,
  Popper,
  Grow,
  Paper,
  ClickAwayListener,
  MenuList,
  MenuItem,
  ListItemText,
  CircularProgress,
} from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useRecordContext, useResourceContext, useRefresh } from 'react-admin';
import { useWorkflowState, getTransitionMeta } from '../../hooks/useWorkflowState.ts';

interface WorkflowButtonProps {
  resource?: string;
}

/**
 * Workflow button with primary action and dropdown for secondary transitions.
 * Shows the most logical next transition as the main button action.
 */
export function WorkflowButton({ resource: resourceProp }: WorkflowButtonProps) {
  const record = useRecordContext();
  const resourceFromContext = useResourceContext();
  const resource = resourceProp ?? resourceFromContext;
  const refresh = useRefresh();

  const [open, setOpen] = useState(false);
  const [applying, setApplying] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);

  const {
    loading,
    workflowState,
    primaryTransition,
    secondaryTransitions,
    applyTransition,
  } = useWorkflowState(resource, record?.id);

  // Don't render if no workflow state or no transitions available
  if (!workflowState || !primaryTransition) {
    return null;
  }

  const primaryMeta = getTransitionMeta(primaryTransition);
  const hasSecondary = secondaryTransitions.length > 0;

  const handlePrimaryClick = async () => {
    setApplying(true);
    try {
      await applyTransition(primaryTransition);
      refresh();
    } finally {
      setApplying(false);
    }
  };

  const handleSecondaryClick = async (transition: string) => {
    setOpen(false);
    setApplying(true);
    try {
      await applyTransition(transition);
      refresh();
    } finally {
      setApplying(false);
    }
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: Event) => {
    if (anchorRef.current?.contains(event.target as HTMLElement)) {
      return;
    }
    setOpen(false);
  };

  const isDisabled = loading || applying;

  // Single button if no secondary transitions
  if (!hasSecondary) {
    return (
      <Button
        variant="contained"
        color={primaryMeta.color}
        onClick={handlePrimaryClick}
        disabled={isDisabled}
        startIcon={applying ? <CircularProgress size={16} color="inherit" /> : undefined}
      >
        {primaryMeta.label}
      </Button>
    );
  }

  // Button group with dropdown for secondary transitions
  return (
    <>
      <ButtonGroup
        variant="contained"
        color={primaryMeta.color}
        ref={anchorRef}
        disabled={isDisabled}
      >
        <Button
          onClick={handlePrimaryClick}
          startIcon={applying ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          {primaryMeta.label}
        </Button>
        <Button
          size="small"
          onClick={handleToggle}
          aria-controls={open ? 'workflow-menu' : undefined}
          aria-expanded={open ? 'true' : undefined}
          aria-haspopup="menu"
        >
          <ArrowDropDownIcon />
        </Button>
      </ButtonGroup>
      <Popper
        sx={{ zIndex: 1300 }}
        open={open}
        anchorEl={anchorRef.current}
        transition
        disablePortal
        placement="bottom-end"
      >
        {({ TransitionProps }) => (
          <Grow {...TransitionProps}>
            <Paper elevation={8}>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList id="workflow-menu" autoFocusItem>
                  {secondaryTransitions.map((transition) => {
                    const meta = getTransitionMeta(transition);
                    return (
                      <MenuItem
                        key={transition}
                        onClick={() => handleSecondaryClick(transition)}
                      >
                        <ListItemText>{meta.label}</ListItemText>
                      </MenuItem>
                    );
                  })}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  );
}
