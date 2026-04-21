import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {IconButton, Paper, Tooltip} from '@mui/material';
import {NodeToolbar, Position, useReactFlow} from '@xyflow/react';
import React, {useCallback, useEffect, useRef} from 'react';

import {useSketchLabReadOnly, useToolbarVisibility} from '../../context';
import {getViewportOverflow} from '../../utils/viewport';

import styles from './node-toolbar.module.scss';

const TOOLBAR_OFFSET_PX = 8;
const PAN_DURATION_MS = 200;
// Width reserved for React Flow's Controls overlay along the left edge
// so the toolbar doesn't sit underneath it after panning into view.
const CONTROLS_WIDTH_PX = 60;
const FOCUSABLE_SELECTOR =
  'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface NodeToolbarShellProps {
  nodeId: string;
  ariaLabel: string;
  children: React.ReactNode;
}

export default function NodeToolbarShell({
  nodeId,
  ariaLabel,
  children,
}: NodeToolbarShellProps) {
  const readOnly = useSketchLabReadOnly();
  const {openToolbarNodeId, closeToolbar, focusToolbarOnOpen} =
    useToolbarVisibility();
  const {getViewport, setViewport} = useReactFlow();
  const containerRef = useRef<HTMLDivElement>(null);
  const isVisible = openToolbarNodeId === nodeId;
  const wasVisibleRef = useRef(false);

  // When isVisible changes from false to true, read the focusToolbarOnOpen ref. If
  // set, the toolbar was opened via keyboard ("e") and should grab focus
  // for the trap; otherwise the click path keeps focus on the node.
  // Also pans the viewport if the toolbar is not fully in view.
  useEffect(() => {
    if (isVisible && !wasVisibleRef.current) {
      if (focusToolbarOnOpen.current) {
        focusToolbarOnOpen.current = false;
        const first =
          containerRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
        first?.focus();
      }
      // Defer until after React Flow positions the toolbar in the DOM
      // so getBoundingClientRect reflects the final placement.
      requestAnimationFrame(() => {
        const toolbarEl = containerRef.current?.closest<HTMLElement>(
          '.react-flow__node-toolbar'
        );
        if (!toolbarEl) return;
        const overflow = getViewportOverflow(toolbarEl, {
          left: CONTROLS_WIDTH_PX,
        });
        if (!overflow) return;
        const viewport = getViewport();
        setViewport(
          {
            x: viewport.x + overflow.dx,
            y: viewport.y + overflow.dy,
            zoom: viewport.zoom,
          },
          {duration: PAN_DURATION_MS}
        );
      });
    }
    wasVisibleRef.current = isVisible;
  }, [isVisible, focusToolbarOnOpen, getViewport, setViewport]);

  const returnFocusToNode = useCallback(() => {
    const nodeElement = document.querySelector<HTMLElement>(
      `.react-flow__node[data-id="${nodeId}"]`
    );
    nodeElement?.focus();
  }, [nodeId]);

  const handleClose = useCallback(() => {
    closeToolbar();
    returnFocusToNode();
  }, [closeToolbar, returnFocusToNode]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        handleClose();
        return;
      }
      if (event.key !== 'Tab') return;

      const focusables =
        containerRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (!focusables || focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        event.stopPropagation();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        event.stopPropagation();
        first.focus();
      } else {
        // Mid-traversal: let the browser move focus, but block the
        // canvas-level Tab handler from reinterpreting as node nav.
        event.stopPropagation();
      }
    },
    [handleClose]
  );

  if (readOnly) {
    return null;
  }
  return (
    <NodeToolbar
      nodeId={nodeId}
      position={Position.Left}
      offset={TOOLBAR_OFFSET_PX}
      isVisible={isVisible}
    >
      <Paper
        ref={containerRef}
        className={styles.toolbar}
        elevation={3}
        role="toolbar"
        aria-label={ariaLabel}
        onKeyDown={handleKeyDown}
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
              onKeyDown={event => {
                // Drive Enter/Space directly instead of letting the
                // browser synthesize a click: the synthesized click
                // races with the focus move in handleClose and the
                // toolbar can end up reopened.
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  event.stopPropagation();
                  handleClose();
                }
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
    </NodeToolbar>
  );
}
