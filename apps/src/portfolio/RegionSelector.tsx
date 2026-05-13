import React, {useEffect, useState} from 'react';

import moduleStyles from './RegionSelector.module.scss';

export interface SelectionRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Props {
  onSelect: (rect: SelectionRect) => void;
  onCancel: () => void;
}

const MIN_SIZE = 10;

function nextFrame(): Promise<void> {
  return new Promise(resolve => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

export default function RegionSelector({onSelect, onCancel}: Props) {
  const [start, setStart] = useState<{x: number; y: number} | null>(null);
  const [current, setCurrent] = useState<{x: number; y: number} | null>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onCancel]);

  if (hidden) return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    setStart({x: e.clientX, y: e.clientY});
    setCurrent({x: e.clientX, y: e.clientY});
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!start) return;
    setCurrent({x: e.clientX, y: e.clientY});
  };

  const handleMouseUp = async () => {
    if (!start || !current) {
      onCancel();
      return;
    }
    const rect: SelectionRect = {
      x: Math.min(start.x, current.x),
      y: Math.min(start.y, current.y),
      width: Math.abs(current.x - start.x),
      height: Math.abs(current.y - start.y),
    };
    if (rect.width < MIN_SIZE || rect.height < MIN_SIZE) {
      onCancel();
      return;
    }
    setHidden(true);
    await nextFrame();
    onSelect(rect);
  };

  const selectionStyle =
    start && current
      ? {
          left: Math.min(start.x, current.x),
          top: Math.min(start.y, current.y),
          width: Math.abs(current.x - start.x),
          height: Math.abs(current.y - start.y),
        }
      : null;

  return (
    <div
      className={moduleStyles.overlay}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {selectionStyle && (
        <div className={moduleStyles.selection} style={selectionStyle} />
      )}
      <div className={moduleStyles.instructions}>
        Drag to select an area. Press ESC to cancel.
      </div>
    </div>
  );
}
