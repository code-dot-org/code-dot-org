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

import {SKETCHLAB_TOOLBAR_PANEL_CLASS} from '@cdo/apps/sketchlab/reactFlow/constants';
import {useToolbarVisibility} from '@cdo/apps/sketchlab/reactFlow/context';

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
  const valueId = useId();
  const popoverId = useId();
  const {theme} = useTheme();
  const {setPopoverOpen} = useToolbarVisibility();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(false);
  // When set, suppresses the post-close trigger refocus so a Tab/Shift+Tab
  // handler can land focus elsewhere instead.
  const skipTriggerFocusRef = useRef(false);
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

  // When the popover closes, move focus back to the trigger button.
  // MUI usually does this itself, but other canvas focus listeners can
  // intercept the close and leave focus on <body>. Skipped when a Tab
  // handler has already chosen a different focus target.
  useEffect(() => {
    if (wasOpenRef.current && !open) {
      if (!skipTriggerFocusRef.current) {
        triggerRef.current?.focus();
      }
      skipTriggerFocusRef.current = false;
    }
    wasOpenRef.current = open;
  }, [open]);

  // Tab closes the popover and moves focus to the next/previous toolbar
  // control (skipping the trigger), so the user can keep Tab-navigating
  // through the toolbar without an extra tab.
  const handlePopoverKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key !== 'Tab') return;
      event.preventDefault();
      const trigger = triggerRef.current;
      const toolbar = trigger?.closest(`.${SKETCHLAB_TOOLBAR_PANEL_CLASS}`);
      if (trigger && toolbar) {
        const focusables = Array.from(
          toolbar.querySelectorAll<HTMLElement>(
            'button:not(:disabled), input:not(:disabled), [tabindex]:not([tabindex="-1"])'
          )
        );
        const idx = focusables.indexOf(trigger);
        const target = event.shiftKey
          ? focusables[idx - 1]
          : focusables[idx + 1];
        if (target) {
          skipTriggerFocusRef.current = true;
          // Defer until after the popover unmounts and MUI's TrapFocus
          // tears down, otherwise it pulls focus back inside.
          setTimeout(() => target.focus(), 0);
        }
      }
      closePopover();
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
        aria-labelledby={`${labelId} ${valueId}`}
        aria-haspopup={popoverRole === 'menu' ? 'menu' : 'dialog'}
        aria-expanded={open}
        aria-controls={open ? popoverId : undefined}
        onClick={event => setAnchorEl(event.currentTarget)}
      >
        <span className={styles.dropdownTriggerContent}>
          {triggerPreview}
          <Typography
            id={valueId}
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
        <div
          id={popoverId}
          data-theme={theme}
          role={popoverRole === 'dialog' ? 'dialog' : undefined}
          aria-label={
            popoverRole === 'dialog' ? popoverAriaLabel ?? label : undefined
          }
          className={styles.popoverContent}
          onKeyDown={handlePopoverKeyDown}
        >
          {renderPopoverContent(closePopover)}
        </div>
      </Popover>
    </div>
  );
}
