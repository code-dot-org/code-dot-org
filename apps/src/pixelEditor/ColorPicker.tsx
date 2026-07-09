import {WithTooltip} from '@code-dot-org/component-library/tooltip';
import React, {useCallback, useEffect, useRef, useState} from 'react';

import {RGBA} from './tools';

import moduleStyles from './pixel-editor.module.scss';

const SPECTRUM_WIDTH = 240;
const SPECTRUM_HEIGHT = 150;

/**
 * Paint the full color range into one rectangle: hue left-to-right, running
 * from white at the top through the pure hue to black at the bottom.
 */
function paintSpectrum(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return;
  }
  const hue = ctx.createLinearGradient(0, 0, canvas.width, 0);
  for (let i = 0; i <= 12; i++) {
    hue.addColorStop(i / 12, `hsl(${(i / 12) * 360}, 100%, 50%)`);
  }
  ctx.fillStyle = hue;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const light = ctx.createLinearGradient(0, 0, 0, canvas.height);
  light.addColorStop(0, 'rgba(255, 255, 255, 1)');
  light.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
  light.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
  light.addColorStop(1, 'rgba(0, 0, 0, 1)');
  ctx.fillStyle = light;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

interface ColorPickerProps {
  color: RGBA;
  onChange: (color: RGBA) => void;
}

/**
 * The editor's single color choice: a swatch that opens a popover containing
 * the full color range in one rectangle. Click or drag to pick; click
 * anywhere else to close.
 */
const ColorPicker: React.FunctionComponent<ColorPickerProps> = ({
  color,
  onChange,
}) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (open && canvasRef.current) {
      paintSpectrum(canvasRef.current);
    }
  }, [open]);

  // Close on any pointerdown outside the picker.
  useEffect(() => {
    if (!open) {
      return;
    }
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  const pick = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) {
        return;
      }
      const rect = canvas.getBoundingClientRect();
      const x = Math.min(
        canvas.width - 1,
        Math.max(0, Math.round(e.clientX - rect.left))
      );
      const y = Math.min(
        canvas.height - 1,
        Math.max(0, Math.round(e.clientY - rect.top))
      );
      const [r, g, b] = ctx.getImageData(x, y, 1, 1).data;
      onChange([r, g, b, 255]);
    },
    [onChange]
  );

  const swatchButton = (
    <button
      type="button"
      className={moduleStyles.swatch}
      style={{
        backgroundColor: `rgb(${color[0]}, ${color[1]}, ${color[2]})`,
      }}
      onClick={() => setOpen(o => !o)}
      aria-label="Choose color"
    />
  );

  return (
    <div ref={rootRef} className={moduleStyles.colorPicker}>
      {open ? (
        // No tooltip while the palette is open: the bubble sits on the same
        // alignment line and would cover its colors.
        swatchButton
      ) : (
        <WithTooltip
          tooltipProps={{
            tooltipId: 'pixel-color-tooltip',
            text: 'Color',
            size: 's',
            direction: 'onRight',
            className: moduleStyles.pixelTooltip,
          }}
          hideDelayMs={10}
          hideOnFirstLeave={true}
        >
          {swatchButton}
        </WithTooltip>
      )}
      {open && (
        <div className={moduleStyles.spectrumPopover}>
          <canvas
            ref={canvasRef}
            width={SPECTRUM_WIDTH}
            height={SPECTRUM_HEIGHT}
            onPointerDown={e => {
              e.currentTarget.setPointerCapture(e.pointerId);
              pick(e);
            }}
            onPointerMove={e => {
              if (e.buttons & 1) {
                pick(e);
              }
            }}
            // The pick is done when the press ends (a drag can refine the
            // color first); dismiss the picker.
            onPointerUp={() => setOpen(false)}
          />
        </div>
      )}
    </div>
  );
};

export default ColorPicker;
