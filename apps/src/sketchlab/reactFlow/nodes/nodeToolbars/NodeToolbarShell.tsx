import {Paper} from '@mui/material';
import {NodeToolbar, Position, useReactFlow} from '@xyflow/react';
import React, {useCallback, useEffect, useRef} from 'react';

import {useSketchLabReadOnly, useToolbarVisibility} from '../../context';

import styles from './node-toolbar.module.scss';

const TOOLBAR_OFFSET_PX = 8;
const PAN_DURATION_MS = 200;
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
  const paperRef = useRef<HTMLDivElement>(null);
  const isVisible = openToolbarNodeId === nodeId;
  const wasVisibleRef = useRef(false);

  // On the rising edge of isVisible, consume the focus-on-open ref. If
  // set, the toolbar was opened via keyboard ("e") and should grab focus
  // for the trap; otherwise the click path keeps focus on the node. Also
  // pans the viewport if the toolbar is not fully in view — it extends
  // past the node to the left and can sit outside the container even
  // when the node itself is visible.
  useEffect(() => {
    if (isVisible && !wasVisibleRef.current) {
      if (focusToolbarOnOpen.current) {
        focusToolbarOnOpen.current = false;
        const first =
          paperRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
        first?.focus();
      }
      // Defer until after React Flow positions the toolbar in the DOM
      // so getBoundingClientRect reflects the final placement.
      requestAnimationFrame(() => {
        const toolbarEl = paperRef.current?.closest<HTMLElement>(
          '.react-flow__node-toolbar'
        );
        const container = toolbarEl?.closest<HTMLElement>('.react-flow');
        if (!toolbarEl || !container) return;

        const containerRect = container.getBoundingClientRect();
        const toolbarRect = toolbarEl.getBoundingClientRect();

        let dx = 0;
        let dy = 0;
        if (toolbarRect.left < containerRect.left) {
          dx = containerRect.left - toolbarRect.left;
        } else if (toolbarRect.right > containerRect.right) {
          dx = containerRect.right - toolbarRect.right;
        }
        if (toolbarRect.top < containerRect.top) {
          dy = containerRect.top - toolbarRect.top;
        } else if (toolbarRect.bottom > containerRect.bottom) {
          dy = containerRect.bottom - toolbarRect.bottom;
        }

        if (dx !== 0 || dy !== 0) {
          const viewport = getViewport();
          setViewport(
            {x: viewport.x + dx, y: viewport.y + dy, zoom: viewport.zoom},
            {duration: PAN_DURATION_MS}
          );
        }
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

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        closeToolbar();
        returnFocusToNode();
        return;
      }
      if (event.key !== 'Tab') return;

      const focusables =
        paperRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
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
    [closeToolbar, returnFocusToNode]
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
        ref={paperRef}
        className={styles.toolbar}
        elevation={3}
        role="toolbar"
        aria-label={ariaLabel}
        onKeyDown={handleKeyDown}
      >
        {children}
      </Paper>
    </NodeToolbar>
  );
}
