import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {IconButton, Paper, Tooltip} from '@mui/material';
import {NodeToolbar, Position, useReactFlow} from '@xyflow/react';
import FocusTrap from 'focus-trap-react';
import React, {useCallback, useEffect, useRef} from 'react';

import {useSketchLabReadOnly, useToolbarVisibility} from '../../context';
import {getViewportOverflow} from '../../utils/viewport';

import styles from './node-toolbar.module.scss';

const TOOLBAR_OFFSET_PX = 8;
const PAN_DURATION_MS = 200;
// Width reserved for React Flow's Controls overlay along the left edge
// so the toolbar doesn't sit underneath it after panning into view.
const CONTROLS_WIDTH_PX = 60;

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

  // Pan the viewport into view when the toolbar first becomes visible,
  // and clear the keyboard-open flag now that FocusTrap has consumed it.
  useEffect(() => {
    if (isVisible && !wasVisibleRef.current) {
      focusToolbarOnOpen.current = false;
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

  // focus-trap handles Tab wrapping; stop propagation so the canvas-level
  // Tab handler doesn't also treat it as node nav.
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Tab') {
        event.stopPropagation();
      }
    },
    []
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
      <FocusTrap
        active={isVisible}
        focusTrapOptions={{
          // undefined = focus-trap default (first tabbable); false = don't
          // move focus. The ref is set by the keyboard-open path in
          // ReactFlowCanvas; the click-open path leaves it false so focus
          // stays on the node.
          initialFocus: focusToolbarOnOpen.current ? undefined : false,
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
          returnFocusOnDeactivate: false,
          clickOutsideDeactivates: false,
        }}
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
      </FocusTrap>
    </NodeToolbar>
  );
}
