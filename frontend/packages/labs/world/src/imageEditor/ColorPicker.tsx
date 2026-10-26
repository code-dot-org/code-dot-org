import classNames from 'classnames';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FunctionComponent,
  type PointerEvent as ReactPointerEvent,
} from 'react';

import {
  paintSpectrum,
  pickSpectrum,
  SPECTRUM_HEIGHT,
  SPECTRUM_WIDTH,
} from '../colorSpectrum';

import PixelTooltip from './PixelTooltip';
import {TRANSPARENT, type RGBA} from './tools';

import moduleStyles from './pixel-editor.module.scss';

interface ColorPickerProps {
  color: RGBA;
  onChange: (color: RGBA) => void;
  /** Nothing may be picked — the swatch still shows what is chosen. */
  disabled?: boolean;
  // Recently used colors, most recent first; shown as one row under the
  // spectrum, after the permanent transparent swatch.
  recentColors?: RGBA[];
}

/**
 * The editor's single color choice: a swatch that opens a popover containing
 * the full color range in one rectangle. Click or drag to pick; click
 * anywhere else to close.
 */
const ColorPicker: FunctionComponent<ColorPickerProps> = ({
  disabled = false,
  color,
  onChange,
  recentColors = [],
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

  // While the palette is open, Escape closes just the palette: capture phase
  // + stopPropagation keep the modal's own bubble-phase Escape handler
  // (which cancels the whole editor) from also firing.
  useEffect(() => {
    if (!open) {
      return;
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setOpen(false);
      }
    };
    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [open]);

  const pick = useCallback(
    (e: ReactPointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      const picked = canvas && pickSpectrum(canvas, e.clientX, e.clientY);
      if (picked) {
        onChange([...picked, 255]);
      }
    },
    [onChange],
  );

  const isTransparent = color[3] === 0;
  const swatchButton = (
    <button
      type="button"
      className={classNames(
        moduleStyles.swatch,
        isTransparent && moduleStyles.swatchTransparent,
      )}
      style={
        isTransparent
          ? undefined
          : {backgroundColor: `rgb(${color[0]}, ${color[1]}, ${color[2]})`}
      }
      disabled={disabled}
      onClick={() => setOpen(o => !o)}
      aria-label="Choose color"
    />
  );

  const pickAndClose = (picked: RGBA) => {
    onChange(picked);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className={moduleStyles.colorPicker}>
      {open ? (
        // No tooltip while the palette is open: the bubble sits on the same
        // alignment line and would cover its colors.
        swatchButton
      ) : (
        <PixelTooltip tooltipId="pixel-color-tooltip" text="Color">
          {swatchButton}
        </PixelTooltip>
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
          <div className={moduleStyles.recentRow}>
            <button
              type="button"
              className={classNames(
                moduleStyles.recentSwatch,
                moduleStyles.swatchTransparent,
              )}
              aria-label="Transparent"
              title="Transparent"
              onClick={() => pickAndClose(TRANSPARENT)}
            />
            {recentColors.map((c, i) => (
              <button
                key={`${c.join('-')}-${i}`}
                type="button"
                className={moduleStyles.recentSwatch}
                style={{backgroundColor: `rgb(${c[0]}, ${c[1]}, ${c[2]})`}}
                aria-label={`Recent color ${i + 1}`}
                onClick={() => pickAndClose([c[0], c[1], c[2], 255])}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorPicker;
