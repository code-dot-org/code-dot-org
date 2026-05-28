import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {IconButton, Paper, Tooltip, Typography} from '@mui/material';
import FocusTrap from 'focus-trap-react';
import React, {useCallback, useLayoutEffect, useRef, useState} from 'react';

import {
  useSketchLabReadOnly,
  useToolbarVisibility,
} from '@cdo/apps/sketchlab/reactFlow/context';

import styles from './toolbar-shell.module.scss';

// Gap between the toolbar's lower edge and the Controls panel.
const TOOLBAR_BOTTOM_GAP_PX = 32;
const TOOLBAR_MIN_HEIGHT_PX = 120;

interface ToolbarShellProps {
  target: {type: 'node' | 'edge'; id: string};
  ariaLabel: string;
  title: string;
  children: React.ReactNode;
}

export default function ToolbarShell({
  target,
  ariaLabel,
  title,
  children,
}: ToolbarShellProps) {
  const readOnly = useSketchLabReadOnly();
  const {openToolbarTarget, trapFocus, closeToolbar, isAnyPopoverOpen} =
    useToolbarVisibility();
  const isVisible =
    openToolbarTarget?.type === target.type &&
    openToolbarTarget.id === target.id;

  const containerRef = useRef<HTMLDivElement>(null);
  const [maxHeight, setMaxHeight] = useState<number | undefined>(undefined);

  // The React Flow canvas wrapper can be taller than the visible window.
  // Cap the toolbar's max-height against whichever is higher on screen:
  // the bottom-right Controls panel, or the window's lower edge.
  // Recompute on resize.
  useLayoutEffect(() => {
    if (!isVisible) return;
    const container = containerRef.current;
    if (!container) return;
    const wrapper = container.closest('.react-flow');

    const recomputeHeight = () => {
      const top = container.getBoundingClientRect().top;
      const controls = wrapper?.querySelector('.react-flow__controls');
      const controlsTop =
        controls?.getBoundingClientRect().top ?? window.innerHeight;
      const bottomAnchor = Math.min(controlsTop, window.innerHeight);
      const available = bottomAnchor - top - TOOLBAR_BOTTOM_GAP_PX;
      setMaxHeight(Math.max(available, TOOLBAR_MIN_HEIGHT_PX));
    };
    recomputeHeight();

    window.addEventListener('resize', recomputeHeight);
    const observer = wrapper ? new ResizeObserver(recomputeHeight) : null;
    if (wrapper && observer) observer.observe(wrapper);
    return () => {
      window.removeEventListener('resize', recomputeHeight);
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

  // Stop clicks on non-interactive parts of the toolbar (background
  // padding, labels) from moving focus off the selected node/edge.
  const preventAutoClose = (event: React.MouseEvent) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (
      target.closest(
        'button, input, textarea, select, a, [contenteditable="true"], ' +
          '[tabindex]:not([tabindex="-1"]), [role="slider"], [role="button"]'
      )
    ) {
      return;
    }
    event.preventDefault();
  };

  return (
    <FocusTrap
      // Deactivate (not pause) while a MUI popover is open. Both traps
      // would otherwise fight each other; deactivation removes the
      // focusin listener synchronously in commit phase, before MUI's
      // TrapFocus activates in useEffect.
      active={trapFocus && !isAnyPopoverOpen}
      focusTrapOptions={{
        // Don't snap focus on re-activation — keep it where MUI's
        // nodeToRestore put it (the dropdown trigger).
        initialFocus: false,
        // Return false so the trap stays active; isVisible=false handles
        // the actual deactivation.
        escapeDeactivates: event => {
          event.preventDefault();
          event.stopPropagation();
          handleClose();
          return false;
        },
        // handleClose owns user-initiated focus return.
        returnFocusOnDeactivate: false,
        clickOutsideDeactivates: true,
      }}
    >
      <Paper
        ref={containerRef}
        className={styles.toolbar}
        elevation={0}
        role="toolbar"
        aria-label={ariaLabel}
        style={{maxHeight}}
        onMouseDown={preventAutoClose}
      >
        <div className={styles.header}>
          <Typography
            variant="overline3"
            className={styles.headerTitle}
            aria-hidden="true"
          >
            {title}
          </Typography>
          <Tooltip title="Close toolbar" placement="top">
            <IconButton
              size="small"
              className={styles.closeButton}
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
        <div className={styles.scrollContent}>{children}</div>
      </Paper>
    </FocusTrap>
  );
}
