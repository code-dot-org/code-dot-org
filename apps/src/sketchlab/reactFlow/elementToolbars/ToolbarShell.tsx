import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {IconButton, Paper, Tooltip} from '@mui/material';
import {
  EdgeToolbar,
  NodeToolbar,
  Position,
  useReactFlow,
  type XYPosition,
} from '@xyflow/react';
import FocusTrap from 'focus-trap-react';
import React, {useCallback, useEffect, useRef} from 'react';

import {
  useSketchLabReadOnly,
  type ToolbarTarget,
  useToolbarVisibility,
} from '@cdo/apps/sketchlab/reactFlow/context';
import {getViewportOverflow} from '@cdo/apps/sketchlab/reactFlow/utils/viewport';

import styles from './element-toolbar.module.scss';

const TOOLBAR_OFFSET_PX = 8;
const PAN_DURATION_MS = 200;
// Width reserved for React Flow's Controls overlay along the left edge
// so the toolbar doesn't sit underneath it after panning into view.
const CONTROLS_WIDTH_PX = 60;
// React Flow normally stacks the toolbar at its anchor node's zIndex + 1.
// Pin the toolbar to a large constant so it always
// floats above the canvas regardless of the anchor's zIndex.
// 2147483647 is the max signed 32-bit integer, a commonly used CSS z-index cap.
const TOOLBAR_Z_INDEX = 2147483647;

interface ToolbarShellProps {
  target: ToolbarTarget;
  // Required when target.type === 'edge'. Flow-coordinate point that the
  // toolbar's right edge should align to.
  anchorFlowPosition?: XYPosition;
  // Optional additional padding for right edge of toolbar. Only used for edges.
  anchorRightPaddingPx?: number;
  ariaLabel: string;
  children: React.ReactNode;
}

export default function ToolbarShell({
  target,
  anchorFlowPosition,
  anchorRightPaddingPx,
  ariaLabel,
  children,
}: ToolbarShellProps) {
  const readOnly = useSketchLabReadOnly();
  const {openToolbarTarget, trapFocus, closeToolbar} = useToolbarVisibility();
  const {getViewport, setViewport} = useReactFlow();
  const containerRef = useRef<HTMLDivElement>(null);
  const isVisible =
    openToolbarTarget?.type === target.type &&
    openToolbarTarget.id === target.id;
  const wasVisibleRef = useRef(false);

  // Pan the viewport into view when the toolbar first becomes visible.
  useEffect(() => {
    if (isVisible && !wasVisibleRef.current) {
      // Defer until after React Flow positions the toolbar in the DOM
      // so getBoundingClientRect reflects the final placement.
      requestAnimationFrame(() => {
        const toolbarEl = containerRef.current;
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
  }, [isVisible, getViewport, setViewport]);

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

  if (readOnly) {
    return null;
  }

  const toolbarBody = (
    <FocusTrap
      active={isVisible && trapFocus}
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
        ref={containerRef}
        className={styles.toolbar}
        elevation={3}
        role="toolbar"
        aria-label={ariaLabel}
        // The toolbar is a DOM portal but React events still bubble
        // through the component tree to the owning node, whose
        // onDoubleClick starts inline label/text editing. Stop double clicks
        // here so double-clicking inside the toolbar (e.g. on the rotation input)
        // does not enter edit mode.
        onDoubleClick={event => event.stopPropagation()}
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

  if (target.type === 'edge' && anchorFlowPosition) {
    return (
      <EdgeToolbar
        edgeId={target.id}
        x={anchorFlowPosition.x}
        y={anchorFlowPosition.y}
        alignX="right"
        alignY="center"
        isVisible={isVisible}
        style={{zIndex: TOOLBAR_Z_INDEX}}
      >
        <div style={{paddingRight: anchorRightPaddingPx ?? TOOLBAR_OFFSET_PX}}>
          {toolbarBody}
        </div>
      </EdgeToolbar>
    );
  }

  return (
    <NodeToolbar
      nodeId={target.id}
      position={Position.Left}
      offset={TOOLBAR_OFFSET_PX}
      isVisible={isVisible}
      style={{zIndex: TOOLBAR_Z_INDEX}}
    >
      {toolbarBody}
    </NodeToolbar>
  );
}
