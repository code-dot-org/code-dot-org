import React, {useCallback, useEffect, useState} from 'react';

import {isTargetEditable} from '@cdo/apps/util/isTargetEditable';

import {CanvasTool} from '../types';

export const MIDDLE_MOUSE_BUTTON = 1;

const SELECT_TOOL_KEY = 's';
const HAND_TOOL_KEY = 'h';

interface UseCanvasToolSwitchingOptions {
  setCanvasTool: (tool: CanvasTool) => void;
  readOnly: boolean;
  // Tool switching is suppressed while these modes own the keyboard, so a
  // half-finished connection or group selection can't be stranded behind the
  // hand tool.
  connecting: boolean;
  isGroupMode: boolean;
  canvasContainerRef: React.RefObject<HTMLElement>;
  // The pan surface, and the single tab stop, in hand mode.
  workspaceRef: React.RefObject<HTMLElement>;
}

/**
 * Two ways to reach the hand tool without going to the toolbar: "h" for hand
 * and "s" for select, plus a held middle mouse button for a momentary pan.
 *
 * The middle button pans through React Flow's own `panOnDrag` button list
 * rather than by switching `canvasTool`, because the gesture has to start on
 * the mousedown that requests it — a React state change lands a frame too
 * late. `middleButtonHeld` therefore only drives the cursor.
 */
export function useCanvasToolSwitching({
  setCanvasTool,
  readOnly,
  connecting,
  isGroupMode,
  canvasContainerRef,
  workspaceRef,
}: UseCanvasToolSwitchingOptions) {
  const [middleButtonHeld, setMiddleButtonHeld] = useState(false);

  const handleMouseDownCapture = useCallback((event: React.MouseEvent) => {
    if (event.button !== MIDDLE_MOUSE_BUTTON) return;
    // Suppress the browser's middle-click autoscroll so the drag only pans.
    event.preventDefault();
    setMiddleButtonHeld(true);
  }, []);

  // Mounted for the life of the canvas, and in the capture phase, so the
  // release is seen even when the pointer ends up outside the canvas: React
  // Flow's own pan-gesture listener stops propagation of the same mouseup,
  // and listeners it registers mid-gesture run after this one.
  useEffect(() => {
    const release = () => setMiddleButtonHeld(false);
    window.addEventListener('mouseup', release, true);
    window.addEventListener('blur', release);
    return () => {
      window.removeEventListener('mouseup', release, true);
      window.removeEventListener('blur', release);
    };
  }, []);

  // Returns true when the keystroke changed tools, so the caller can skip its
  // remaining key handling.
  const handleToolKeyDown = useCallback(
    (event: React.KeyboardEvent): boolean => {
      if (readOnly || connecting || isGroupMode) return false;
      if (event.ctrlKey || event.metaKey || event.altKey) return false;
      if (isTargetEditable(event.target as HTMLElement)) return false;

      let tool: CanvasTool;
      if (event.key === SELECT_TOOL_KEY) {
        tool = 'cursor';
      } else if (event.key === HAND_TOOL_KEY) {
        tool = 'grab';
      } else {
        return false;
      }

      event.preventDefault();
      event.stopPropagation();
      setCanvasTool(tool);
      // Put focus where the new tool expects it: the workspace pans with the
      // arrow keys in hand mode, and nodes stop being focusable there.
      if (tool === 'grab') {
        workspaceRef.current?.focus();
      } else {
        canvasContainerRef.current?.focus();
      }
      return true;
    },
    [
      readOnly,
      connecting,
      isGroupMode,
      setCanvasTool,
      canvasContainerRef,
      workspaceRef,
    ]
  );

  return {middleButtonHeld, handleMouseDownCapture, handleToolKeyDown};
}
