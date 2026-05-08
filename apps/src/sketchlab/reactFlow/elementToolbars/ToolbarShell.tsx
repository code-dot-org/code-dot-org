import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {IconButton, Paper, Tooltip} from '@mui/material';
import FocusTrap from 'focus-trap-react';
import React, {useCallback} from 'react';

import {
  useSketchLabReadOnly,
  useToolbarVisibility,
} from '@cdo/apps/sketchlab/reactFlow/context';

import styles from './element-toolbar.module.scss';

interface ToolbarShellProps {
  target: {type: 'node' | 'edge'; id: string};
  ariaLabel: string;
  children: React.ReactNode;
}

export default function ToolbarShell({
  target,
  ariaLabel,
  children,
}: ToolbarShellProps) {
  const readOnly = useSketchLabReadOnly();
  const {openToolbarTarget, trapFocus, closeToolbar} = useToolbarVisibility();
  const isVisible =
    openToolbarTarget?.type === target.type &&
    openToolbarTarget.id === target.id;

  const returnFocusToTarget = useCallback(() => {
    const selector =
      target.type === 'node'
        ? `.react-flow__node[data-id="${target.id}"]`
        : `.react-flow__edge[data-id="${target.id}"]`;
    const element = document.querySelector<HTMLElement>(selector);
    element?.focus();
  }, [target.id, target.type]);

  const handleClose = useCallback(() => {
    closeToolbar();
    returnFocusToTarget();
  }, [closeToolbar, returnFocusToTarget]);

  if (readOnly || !isVisible) {
    return null;
  }

  return (
    <FocusTrap
      active={trapFocus}
      focusTrapOptions={{
        // Route Escape through handleClose. Return false so the trap
        // stays active; the subsequent isVisible=false flip is what
        // actually deactivates it. We don't use onDeactivate because it
        // also fires when another node's toolbar takes over, and we
        // don't want to move focus in that case.
        escapeDeactivates: event => {
          event.preventDefault();
          event.stopPropagation();
          handleClose();
          return false;
        },
        // If the user clicked on another node we don't want to return
        // focus to the previous node. handleClose handles the
        // user-initiated close cases.
        returnFocusOnDeactivate: false,
        clickOutsideDeactivates: true,
      }}
    >
      <Paper
        className={styles.toolbar}
        elevation={3}
        role="toolbar"
        aria-label={ariaLabel}
        // When the user clicks a non-interactive area of the toolbar
        // (background padding, group spacing, labels), keep focus on
        // the selected node/edge.
        onMouseDown={event => {
          const target = event.target;
          if (!(target instanceof HTMLElement)) return;
          // Skip preventDefault for any focusable / interactive control
          // so MUI widgets (Slider thumb, IconButton, TextField input,
          // etc.) get their native focus on click. The tabindex check
          // also catches custom widgets that aren't covered by tag or
          // role.
          if (
            target.closest(
              'button, input, textarea, select, a, [contenteditable="true"], ' +
                '[tabindex]:not([tabindex="-1"]), [role="slider"], [role="button"]'
            )
          ) {
            return;
          }
          event.preventDefault();
        }}
      >
        <div className={styles.header}>
          <Tooltip title="Close toolbar" placement="top">
            <IconButton
              size="small"
              className={styles['close-button']}
              aria-label="Close toolbar"
              onClick={event => {
                event.stopPropagation();
                handleClose();
              }}
            >
              <FontAwesomeV6Icon
                iconName="xmark"
                iconStyle="solid"
                aria-hidden="true"
              />
            </IconButton>
          </Tooltip>
        </div>
        {children}
      </Paper>
    </FocusTrap>
  );
}
