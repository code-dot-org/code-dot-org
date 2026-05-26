import {useTheme} from '@code-dot-org/component-library/common/contexts';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button, Popover, Typography} from '@mui/material';
import classNames from 'classnames';
import React, {useCallback, useEffect, useId, useRef, useState} from 'react';

import {SKETCHLAB_TOOLBAR_PANEL_CLASS} from '../constants';

import styles from './toolbar-dropdown-row.module.scss';

interface ToolbarDropdownRowProps {
  label: string;
  triggerPreview?: React.ReactNode;
  triggerLabel: string;
  popoverAriaLabel?: string;
  popoverRole?: 'menu' | 'dialog';
  renderPopoverContent: (closePopover: () => void) => React.ReactNode;
}

// Form row: label-left, dropdown-trigger-right. Owns the open/anchor state
// for its popover so each row's submenu is independent. Trigger renders
// "[preview] {triggerLabel} [chevron]" — preview is e.g. a color swatch or
// FA icon supplied by the parent.
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
  const triggerRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);
  // Plain close — MUI Popover's TrapFocus restores focus via its
  // nodeToRestore mechanism. Calling triggerRef.focus() inside this
  // callback races against TrapFocus's enforce-focus listener and
  // triggers a focus loop; we backstop via the open->closed effect
  // below instead.
  const closePopover = useCallback(() => {
    setAnchorEl(null);
  }, []);

  // Backstop: when the popover transitions open->closed, ensure focus
  // lands on the trigger. MUI's nodeToRestore usually handles this, but
  // it can drop focus to <body> when other listeners on the canvas
  // intercept the close sequence. This runs after MUI's TrapFocus has
  // fully torn down, so it doesn't conflict with enforce-focus.
  useEffect(() => {
    if (wasOpenRef.current && !open) {
      triggerRef.current?.focus();
    }
    wasOpenRef.current = open;
  }, [open]);

  return (
    <div className={styles.dropdownRow}>
      <Typography
        id={labelId}
        variant="body3"
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
          <span className={styles.dropdownTriggerLabel}>{triggerLabel}</span>
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
          // Tag both the modal root (which hosts the click-catching
          // Backdrop) and the Paper with the toolbar panel class. The
          // canvas' outside-click listener walks up from event.target;
          // without the root tag, clicks on the Backdrop look
          // like outside-toolbar clicks and dismiss the toolbar.
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
        {/* The popover renders into a body-level portal, escaping the
         * ThemeProvider's <div data-theme={...}> wrapper. */}
        <div data-theme={theme}>{renderPopoverContent(closePopover)}</div>
      </Popover>
    </div>
  );
}
