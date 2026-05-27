import {useTheme} from '@code-dot-org/component-library/common/contexts';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button, Popover, Typography} from '@mui/material';
import classNames from 'classnames';
import React, {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import {SKETCHLAB_TOOLBAR_PANEL_CLASS} from '../constants';
import {useToolbarVisibility} from '../context';

import styles from './toolbar-dropdown-row.module.scss';

interface ToolbarDropdownRowProps {
  label: string;
  triggerPreview?: React.ReactNode;
  triggerLabel: string;
  popoverAriaLabel?: string;
  popoverRole?: 'menu' | 'dialog';
  renderPopoverContent: (closePopover: () => void) => React.ReactNode;
}

// Toolbar row with a label on the left and a dropdown-triggering button on the right.
export default function ToolbarDropdownRow({
  label,
  triggerPreview,
  triggerLabel,
  popoverAriaLabel,
  popoverRole = 'menu',
  renderPopoverContent,
}: ToolbarDropdownRowProps) {
  const labelId = useId();
  const {theme} = useTheme();
  const {setPopoverOpen} = useToolbarVisibility();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const closePopover = useCallback(() => {
    setAnchorEl(null);
  }, []);

  // useLayoutEffect so ToolbarShell deactivates its focus-trap on the
  // same commit, before MUI Popover's own TrapFocus attaches in useEffect.
  useLayoutEffect(() => {
    if (!open) return;
    setPopoverOpen(true);
    return () => setPopoverOpen(false);
  }, [open, setPopoverOpen]);

  // Backstop focus return — MUI's nodeToRestore can drop focus to body when
  // canvas listeners intercept the close.
  useEffect(() => {
    if (wasOpenRef.current && !open) {
      triggerRef.current?.focus();
    }
    wasOpenRef.current = open;
  }, [open]);

  // Tab closes the popover so the user can keep Tab-navigating the toolbar.
  const handlePopoverKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Tab') {
        event.preventDefault();
        closePopover();
      }
    },
    [closePopover]
  );

  return (
    <div className={styles.dropdownRow}>
      <Typography
        id={labelId}
        variant="body4"
        className={styles.dropdownRowLabel}
      >
        {label}
      </Typography>
      <Button
        ref={triggerRef}
        className={styles.dropdownTrigger}
        variant="outlined"
        color="secondary"
        size="small"
        disableRipple
        aria-labelledby={labelId}
        aria-haspopup={popoverRole === 'menu' ? 'menu' : 'dialog'}
        aria-expanded={open}
        onClick={event => setAnchorEl(event.currentTarget)}
      >
        <span className={styles.dropdownTriggerContent}>
          {triggerPreview}
          <Typography
            variant="body4"
            component="strong"
            className={styles.dropdownTriggerLabel}
          >
            {triggerLabel}
          </Typography>
        </span>
        <FontAwesomeV6Icon
          iconName="chevron-down"
          iconStyle="solid"
          className={styles.dropdownChevron}
          aria-hidden="true"
        />
      </Button>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={closePopover}
        anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
        transformOrigin={{vertical: 'top', horizontal: 'right'}}
        slotProps={{
          // Tag the modal root + paper so the canvas' outside-click listener
          // treats them as inside the toolbar.
          root: {
            className: SKETCHLAB_TOOLBAR_PANEL_CLASS,
          },
          paper: {
            className: classNames(
              styles.popoverPaper,
              SKETCHLAB_TOOLBAR_PANEL_CLASS
            ),
            'aria-label': popoverAriaLabel ?? label,
          },
        }}
      >
        {/* Re-apply data-theme; the portal escapes ThemeProvider. */}
        <div data-theme={theme} onKeyDown={handlePopoverKeyDown}>
          {renderPopoverContent(closePopover)}
        </div>
      </Popover>
    </div>
  );
}
