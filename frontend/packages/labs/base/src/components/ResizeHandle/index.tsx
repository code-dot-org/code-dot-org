import {useCallback, useRef, useState} from 'react';

import styles from './resizeHandle.module.css';

const KEY_STEP = 16;

interface ResizeHandleProps {
  /** Axis of movement: 'x' resizes width (a vertical bar), 'y' resizes height. */
  axis: 'x' | 'y';
  /** Called with the pointer delta (px) along the axis as the handle is dragged. */
  onDelta: (delta: number) => void;
  ariaLabel: string;
  /** Current / min / max size of the panel this divides, for `aria-value*`. */
  value: number;
  min: number;
  max: number;
  /**
   * Restore the panel to its default size. Wired to double-click (and Enter /
   * Space, so it is reachable from the keyboard). Not a legacy behavior — legacy
   * bars only drag — but a common convention for split panes.
   */
  onReset?: () => void;
}

/**
 * A draggable divider between two layout panels. Drag with the pointer, or focus
 * and use the arrow keys, to report a size delta to the parent. A lightweight
 * port of the legacy lab2 `ResizeBar` (apps/src/lab2/views/components/layout),
 * shared by every lab that splits panes.
 *
 * The drag uses pointer capture, so a fast drag that outruns the 1px bar — or one
 * that leaves and re-enters the window — keeps tracking and keeps the `dragging`
 * accent lit (rather than dropping it the instant the cursor leaves the bar, the
 * way a `:hover`-only accent would).
 */
const ResizeHandle = ({
  axis,
  onDelta,
  ariaLabel,
  value,
  min,
  max,
  onReset,
}: ResizeHandleProps) => {
  // A ref drives the drag math (read synchronously in the move handler, no render
  // lag); the state drives the `dragging` accent class.
  const draggingRef = useRef(false);
  const lastRef = useRef(0);
  const [dragging, setDragging] = useState(false);

  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      // Capture the pointer so all subsequent moves/up route here, even off the
      // 1px bar or outside the window.
      event.currentTarget.setPointerCapture(event.pointerId);
      lastRef.current = axis === 'x' ? event.clientX : event.clientY;
      draggingRef.current = true;
      setDragging(true);
      // Suppress text selection while dragging.
      document.body.style.userSelect = 'none';
    },
    [axis],
  );

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!draggingRef.current) {
        return;
      }
      const current = axis === 'x' ? event.clientX : event.clientY;
      onDelta(current - lastRef.current);
      lastRef.current = current;
    },
    [axis, onDelta],
  );

  // End the drag. Idempotent: fires from both pointerup and the implicit
  // lostpointercapture (which covers the pointer being cancelled mid-drag).
  const endDrag = useCallback(() => {
    if (!draggingRef.current) {
      return;
    }
    draggingRef.current = false;
    setDragging(false);
    document.body.style.userSelect = '';
  }, []);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      let delta = 0;
      if (axis === 'x') {
        if (event.key === 'ArrowLeft') delta = -KEY_STEP;
        else if (event.key === 'ArrowRight') delta = KEY_STEP;
      } else {
        if (event.key === 'ArrowUp') delta = -KEY_STEP;
        else if (event.key === 'ArrowDown') delta = KEY_STEP;
      }
      if (delta !== 0) {
        event.preventDefault();
        onDelta(delta);
        return;
      }
      // Keyboard equivalent of double-clicking the bar to restore the default.
      if (onReset && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        onReset();
      }
    },
    [axis, onDelta, onReset],
  );

  // A resize divider is the WAI-ARIA window-splitter pattern: a focusable,
  // keyboard-operable `separator`. jsx-a11y treats the separator role as
  // non-interactive, so its interaction / tabindex rules would flag this — but
  // this package's eslint config does not load jsx-a11y, so no disable is
  // needed (adding one errors as an unknown rule). Re-add the disables if base
  // ever adopts the shared react lint config.
  return (
    <div
      role="separator"
      aria-orientation={axis === 'x' ? 'vertical' : 'horizontal'}
      aria-label={ariaLabel}
      aria-valuenow={Math.round(value)}
      aria-valuemin={min}
      aria-valuemax={max}
      tabIndex={0}
      className={`${axis === 'x' ? styles.handleX : styles.handleY}${
        dragging ? ` ${styles.dragging}` : ''
      }`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onLostPointerCapture={endDrag}
      onDoubleClick={onReset}
      onKeyDown={onKeyDown}
      title={onReset ? 'Drag to resize, double-click to reset' : undefined}
    />
  );
};

export default ResizeHandle;
