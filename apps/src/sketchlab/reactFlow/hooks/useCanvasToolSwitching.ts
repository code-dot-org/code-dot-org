import React, {useCallback, useEffect, useState} from 'react';

import {isTargetEditable} from '@cdo/apps/util/isTargetEditable';

import {CanvasTool} from '../types';

export const MIDDLE_MOUSE_BUTTON = 1;

const SELECT_TOOL_KEY = 's';
const HAND_TOOL_KEY = 'h';
const PAN_KEY = ' ';

// Space is the native activation key for these, so it can't be repurposed for
// panning while one of them holds focus.
const ACTIVATABLE_TAGS = ['A', 'BUTTON', 'INPUT', 'SELECT', 'SUMMARY'];
const ACTIVATABLE_ROLES = [
  'button',
  'checkbox',
  'link',
  'menuitem',
  'menuitemcheckbox',
  'menuitemradio',
  'option',
  'radio',
  'switch',
  'tab',
];

function isTargetActivatable(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    ACTIVATABLE_TAGS.includes(target.tagName) ||
    ACTIVATABLE_ROLES.includes(target.getAttribute('role') ?? '')
  );
}

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
 * and "s" for select. Two more give a momentary pan without leaving the current
 * tool: a held middle mouse button, and a held spacebar dragged with the left
 * button.
 *
 * Neither momentary pan switches `canvasTool`; both let the caller widen React
 * Flow's own `panOnDrag` button list instead. The middle button has to, because
 * its gesture starts on the very mousedown that requests it and a React state
 * change lands a frame too late — `middleButtonHeld` therefore only drives the
 * cursor. Space is pressed before the drag, so `spaceHeld` is in place by the
 * time the mousedown arrives and can drive `panOnDrag` directly.
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
  const [spaceHeld, setSpaceHeld] = useState(false);

  const handleMouseDownCapture = useCallback((event: React.MouseEvent) => {
    if (event.button !== MIDDLE_MOUSE_BUTTON) return;
    // Suppress the browser's middle-click autoscroll so the drag only pans.
    event.preventDefault();
    setMiddleButtonHeld(true);
  }, []);

  // Mounted for the life of the canvas, and in the capture phase, so a release
  // is seen even when the pointer or focus has left the canvas: React Flow's
  // own pan-gesture listener stops propagation of the same mouseup, and
  // listeners it registers mid-gesture run after this one.
  useEffect(() => {
    const releaseButton = () => setMiddleButtonHeld(false);
    const releaseKey = (event: KeyboardEvent) => {
      if (event.key === PAN_KEY) setSpaceHeld(false);
    };
    const releaseAll = () => {
      setMiddleButtonHeld(false);
      setSpaceHeld(false);
    };
    window.addEventListener('mouseup', releaseButton, true);
    window.addEventListener('keyup', releaseKey, true);
    window.addEventListener('blur', releaseAll);
    return () => {
      window.removeEventListener('mouseup', releaseButton, true);
      window.removeEventListener('keyup', releaseKey, true);
      window.removeEventListener('blur', releaseAll);
    };
  }, []);

  // Returns true when the keystroke was consumed — by a tool switch or by the
  // start of a momentary pan — so the caller can skip its remaining key
  // handling.
  const handleToolKeyDown = useCallback(
    (event: React.KeyboardEvent): boolean => {
      if (event.ctrlKey || event.metaKey || event.altKey) return false;
      if (isTargetEditable(event.target as HTMLElement)) return false;

      // The momentary pan is a view-only gesture, so it stays available in the
      // modes that suppress tool switching.
      if (event.key === PAN_KEY) {
        if (isTargetActivatable(event.target)) return false;
        // Space would otherwise scroll the page.
        event.preventDefault();
        event.stopPropagation();
        setSpaceHeld(true);
        return true;
      }

      if (readOnly || connecting || isGroupMode) return false;

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

  return {
    middleButtonHeld,
    spaceHeld,
    handleMouseDownCapture,
    handleToolKeyDown,
  };
}
