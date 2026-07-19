import {useCallback} from 'react';

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
}

/**
 * A draggable divider between two layout panels. Drag with the pointer, or focus
 * and use the arrow keys, to report a size delta to the parent. A lightweight
 * stand-in for the legacy lab2 `ResizeBar`.
 */
const ResizeHandle = ({
  axis,
  onDelta,
  ariaLabel,
  value,
  min,
  max,
}: ResizeHandleProps) => {
  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      let last = axis === 'x' ? event.clientX : event.clientY;

      const onMove = (moveEvent: PointerEvent) => {
        const current = axis === 'x' ? moveEvent.clientX : moveEvent.clientY;
        onDelta(current - last);
        last = current;
      };
      const onUp = () => {
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);
        document.body.style.userSelect = '';
      };

      // Suppress text selection while dragging.
      document.body.style.userSelect = 'none';
      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp);
    },
    [axis, onDelta],
  );

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
      }
    },
    [axis, onDelta],
  );

  // A resize divider is the WAI-ARIA window-splitter pattern: a focusable,
  // keyboard-operable `separator`. jsx-a11y treats the separator role as
  // non-interactive, so its interaction / tabindex rules don't apply here.
  /* eslint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */
  return (
    <div
      role="separator"
      aria-orientation={axis === 'x' ? 'vertical' : 'horizontal'}
      aria-label={ariaLabel}
      aria-valuenow={Math.round(value)}
      aria-valuemin={min}
      aria-valuemax={max}
      tabIndex={0}
      className={axis === 'x' ? styles.handleX : styles.handleY}
      onPointerDown={onPointerDown}
      onKeyDown={onKeyDown}
    />
  );
  /* eslint-enable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */
};

export default ResizeHandle;
