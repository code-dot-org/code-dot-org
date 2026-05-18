import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {IconButton, Paper, Tooltip} from '@mui/material';
import FocusTrap from 'focus-trap-react';
import React, {useCallback, useLayoutEffect, useRef, useState} from 'react';

import {
  useSketchLabReadOnly,
  useToolbarVisibility,
} from '@cdo/apps/sketchlab/reactFlow/context';

import styles from './element-toolbar.module.scss';

// Gap between the toolbar's lower edge and the Controls panel.
const TOOLBAR_BOTTOM_GAP_PX = 32;
const TOOLBAR_MIN_HEIGHT_PX = 120;

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

  // The React Flow canvas wrapper can be taller than the visible window.
  // Cap the toolbar's max-height against whichever is higher on screen:
  // the bottom-right Controls panel, or the window's lower edge.
  // Recompute on resize.
  const paperRef = useRef<HTMLDivElement>(null);
  const [maxHeight, setMaxHeight] = useState<number | undefined>(undefined);
  useLayoutEffect(() => {
    if (!isVisible) return;
    const paper = paperRef.current;
    if (!paper) return;
    const wrapper = paper.closest('.react-flow');

    const recompute = () => {
      const top = paper.getBoundingClientRect().top;
      const controls = wrapper?.querySelector('.react-flow__controls');
      const controlsTop =
        controls?.getBoundingClientRect().top ?? window.innerHeight;
      const bottomAnchor = Math.min(controlsTop, window.innerHeight);
      const available = bottomAnchor - top - TOOLBAR_BOTTOM_GAP_PX;
      setMaxHeight(Math.max(available, TOOLBAR_MIN_HEIGHT_PX));
    };
    recompute();

    window.addEventListener('resize', recompute);
    const observer = wrapper ? new ResizeObserver(recompute) : null;
    if (wrapper && observer) observer.observe(wrapper);
    return () => {
      window.removeEventListener('resize', recompute);
      observer?.disconnect();
    };
  }, [isVisible]);

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
        ref={paperRef}
        className={styles.toolbar}
        elevation={3}
        role="toolbar"
        aria-label={ariaLabel}
        style={{maxHeight}}
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
        <div className={styles['scroll-content']}>{children}</div>
      </Paper>
    </FocusTrap>
  );
}
