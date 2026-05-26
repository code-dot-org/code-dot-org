import {useTheme} from '@code-dot-org/component-library/common/contexts';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button, Popover, Typography} from '@mui/material';
import classNames from 'classnames';
import React, {useCallback, useEffect, useId, useRef, useState} from 'react';

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

// Toolbar row with label on the left and a dropdown-triggering button on the right.
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
  // Tracks whether we've incremented the any-popover-open counter, so
  // open/close/unmount each call setPopoverOpen at most once per cycle.
  // A naive open-keyed useEffect double-decrements when the cleanup
  // races the explicit close.
  const incrementedRef = useRef(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  // Open/close both flip local anchor state AND register with the
  // context that tracks any-popover-open. Doing both in the same event
  // handler batches the state updates so ToolbarShell sees
  // isAnyPopoverOpen=true on the SAME render that mounts the Popover —
  // its focus-trap-react then deactivates in commit phase, before MUI's
  // own TrapFocus activates in useEffect (see ToolbarShell for why).
  const openPopover = useCallback(
    (target: HTMLElement) => {
      setAnchorEl(target);
      if (!incrementedRef.current) {
        incrementedRef.current = true;
        setPopoverOpen(true);
      }
    },
    [setPopoverOpen]
  );
  // Plain close — MUI Popover's TrapFocus restores focus via its
  // nodeToRestore mechanism. Calling triggerRef.focus() inside this
  // callback races against TrapFocus's enforce-focus listener and
  // triggers a focus loop; we backstop via the open->closed effect
  // below instead.
  const closePopover = useCallback(() => {
    setAnchorEl(null);
    if (incrementedRef.current) {
      incrementedRef.current = false;
      setPopoverOpen(false);
    }
  }, [setPopoverOpen]);

  // Safety net for the case where the component unmounts while the
  // popover is still open (e.g. user selects a different node and the
  // toolbar swaps): decrement so the counter doesn't get stuck.
  useEffect(() => {
    return () => {
      if (incrementedRef.current) {
        incrementedRef.current = false;
        setPopoverOpen(false);
      }
    };
  }, [setPopoverOpen]);

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

  // Tab closes the popover (forward or backward). MUI's TrapFocus
  // otherwise loops Tab within the popover; users expect Tab to exit
  // and continue navigating the toolbar. Closing here triggers
  // nodeToRestore + our open->closed effect, both of which land focus
  // back on the trigger, so the next Tab moves to the next toolbar row.
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
        onClick={event => openPopover(event.currentTarget)}
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
         * ThemeProvider's <div data-theme={...}> wrapper. The keydown
         * handler intercepts Tab to close the dropdown — see comment
         * above. */}
        <div data-theme={theme} onKeyDown={handlePopoverKeyDown}>
          {renderPopoverContent(closePopover)}
        </div>
      </Popover>
    </div>
  );
}
