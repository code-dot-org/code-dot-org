import * as React from 'react';
import {useCallback, useEffect, useRef, useState} from 'react';
import type {
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
} from 'react';

import PixelTooltip from './PixelTooltip';
import {TRANSPARENT} from './tools';
import type {RGBA} from './tools';

import moduleStyles from './pixel-editor.module.scss';

const cx = (...classes: Array<string | false | undefined>) =>
  classes.filter(Boolean).join(' ');

const SPECTRUM_WIDTH = 240;
const SPECTRUM_HEIGHT = 150;
// Gradient stops across the hue axis; enough that adjacent stops differ by
// 30 degrees of hue and the interpolation error is invisible.
const HUE_STOPS = 12;
// Keyboard steering: Shift+arrow moves the sample cursor this many px.
const KB_SHIFT_STEP = 10;
// Single-key shortcut that opens the picker (C for Color; the circle tool
// moved to O to free it). Shown in the swatch's tooltip/label.
const OPEN_SHORTCUT = 'c';

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
  for (let i = 0; i <= HUE_STOPS; i++) {
    hue.addColorStop(i / HUE_STOPS, `hsl(${(i / HUE_STOPS) * 360}, 100%, 50%)`);
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
  // Recently used colors, in first-seen order; shown as one row under the
  // spectrum, after the permanent transparent swatch.
  recentColors?: RGBA[];
}

/**
 * The editor's single color choice: a swatch that opens a popover containing
 * the full color range in one rectangle. Click or drag to pick; click
 * anywhere else to close. Keyboard: the spectrum takes focus on open, arrow
 * keys steer the sample cursor (color updates live), Enter/Space confirms,
 * Escape reverts to the color the popover opened with.
 */
const ColorPicker: React.FunctionComponent<ColorPickerProps> = ({
  color,
  onChange,
  recentColors = [],
}) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const swatchRef = useRef<HTMLButtonElement | null>(null);
  // The sample cursor, in spectrum-canvas px. Always shown while open and
  // kept in sync with pointer picks, so it marks "where the current color
  // came from" for everyone, not only keyboard users.
  const [cursor, setCursor] = useState({
    x: SPECTRUM_WIDTH / 2,
    y: SPECTRUM_HEIGHT / 2,
  });
  // The color when the popover opened; Escape restores it (cancel), unlike
  // Enter/pointer-up which keep the live-sampled color.
  const colorOnOpenRef = useRef<RGBA>(color);
  // True while the spectrum is being steered by keyboard: the sample cursor
  // is always shown, so the OS pointer is hidden to avoid a second cursor
  // over the spectrum. Any mouse movement turns it back off.
  const [kbSteering, setKbSteering] = useState(false);

  // Return focus to the swatch after closing. Deferred a frame: closing
  // switches the swatch from a bare button to a tooltip-wrapped one, which
  // remounts it — a synchronous focus would land on the detached node.
  const focusSwatchSoon = useCallback(() => {
    requestAnimationFrame(() => swatchRef.current?.focus());
  }, []);

  // Remember the color at open time so Escape can revert to it. viaKeyboard
  // (shortcut) starts in keyboard-steering mode so the OS pointer is hidden.
  const openPicker = useCallback(
    (viaKeyboard = false) => {
      colorOnOpenRef.current = color;
      setKbSteering(viaKeyboard);
      setOpen(true);
    },
    [color],
  );

  // Screen-reader narration; moves are debounced so held arrows don't
  // flood the queue.
  const [announcement, setAnnouncement] = useState('');
  const announceTimerRef = useRef<number>();
  useEffect(() => () => window.clearTimeout(announceTimerRef.current), []);

  useEffect(() => {
    if (open && canvasRef.current) {
      paintSpectrum(canvasRef.current);
      // Keyboard flow: focus moves into the popover on open (and back to
      // the swatch on Enter/Escape). Programmatic focus after a click isn't
      // :focus-visible, so pointer users see no focus ring.
      canvasRef.current.focus();
    }
  }, [open]);

  // Single-key shortcut opens the picker (and focuses the spectrum via the
  // open effect). Mirrors the modal's tool/brush shortcut handler; opening
  // via this key counts as keyboard modality, so the spectrum shows its
  // focus ring.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || open) {
        return;
      }
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')
      ) {
        return;
      }
      if (e.key.toLowerCase() === OPEN_SHORTCUT) {
        e.preventDefault();
        openPicker(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, openPicker]);

  // Close on any pointerdown outside the picker. No focus restore: the
  // press is about to focus whatever was clicked.
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
  // (which cancels the whole editor) from also firing. Escape is a cancel:
  // it puts back the color the popover opened with.
  useEffect(() => {
    if (!open) {
      return;
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onChange(colorOnOpenRef.current);
        setOpen(false);
        focusSwatchSoon();
      }
    };
    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [open, onChange, focusSwatchSoon]);

  // Read the spectrum pixel at (x, y) into the active color.
  const sampleAt = useCallback(
    (x: number, y: number) => {
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) {
        return null;
      }
      const [r, g, b] = ctx.getImageData(x, y, 1, 1).data;
      onChange([r, g, b, 255]);
      return [r, g, b];
    },
    [onChange],
  );

  const pick = useCallback(
    (e: ReactPointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }
      const rect = canvas.getBoundingClientRect();
      const x = Math.min(
        canvas.width - 1,
        Math.max(0, Math.round(e.clientX - rect.left)),
      );
      const y = Math.min(
        canvas.height - 1,
        Math.max(0, Math.round(e.clientY - rect.top)),
      );
      setCursor({x, y});
      sampleAt(x, y);
    },
    [sampleAt],
  );

  // Any mouse movement over the spectrum ends keyboard steering, so the OS
  // pointer reappears.
  const endKbSteering = useCallback(() => setKbSteering(false), []);

  const confirmAndClose = useCallback(() => {
    setOpen(false);
    focusSwatchSoon();
    setAnnouncement('Color selected');
  }, [focusSwatchSoon]);

  const handleSpectrumKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLCanvasElement>) => {
      const ARROWS: {[key: string]: [number, number]} = {
        ArrowLeft: [-1, 0],
        ArrowRight: [1, 0],
        ArrowUp: [0, -1],
        ArrowDown: [0, 1],
      };
      const delta = ARROWS[e.key];
      if (delta) {
        e.preventDefault();
        setKbSteering(true);
        const step = e.shiftKey ? KB_SHIFT_STEP : 1;
        const next = {
          x: Math.min(
            SPECTRUM_WIDTH - 1,
            Math.max(0, cursor.x + delta[0] * step),
          ),
          y: Math.min(
            SPECTRUM_HEIGHT - 1,
            Math.max(0, cursor.y + delta[1] * step),
          ),
        };
        setCursor(next);
        const rgb = sampleAt(next.x, next.y);
        if (rgb) {
          window.clearTimeout(announceTimerRef.current);
          announceTimerRef.current = window.setTimeout(
            () =>
              setAnnouncement(`Red ${rgb[0]}, green ${rgb[1]}, blue ${rgb[2]}`),
            400,
          );
        }
        return;
      }
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        confirmAndClose();
      }
    },
    [cursor, sampleAt, confirmAndClose],
  );

  const isTransparent = color[3] === 0;
  const swatchButton = (
    <button
      ref={swatchRef}
      type="button"
      className={cx(
        moduleStyles.swatch,
        isTransparent && moduleStyles.swatchTransparent,
      )}
      style={
        isTransparent
          ? undefined
          : {backgroundColor: `rgb(${color[0]}, ${color[1]}, ${color[2]})`}
      }
      onClick={() => (open ? setOpen(false) : openPicker())}
      aria-label="Choose color (C)"
    />
  );

  const pickAndClose = (picked: RGBA) => {
    onChange(picked);
    setOpen(false);
    focusSwatchSoon();
  };

  return (
    <div ref={rootRef} className={moduleStyles.colorPicker}>
      {open ? (
        // No tooltip while the palette is open: the bubble sits on the same
        // alignment line and would cover its colors.
        swatchButton
      ) : (
        <PixelTooltip tooltipId="pixel-color-tooltip" text="Color (C)">
          {swatchButton}
        </PixelTooltip>
      )}
      {open && (
        <div className={moduleStyles.spectrumPopover}>
          <div className={moduleStyles.spectrumWrap}>
            {/* role="application" so screen readers hand the arrow keys
                through instead of their virtual cursor — the APG pattern for
                key-driven drawing surfaces. The rule can't know canvas
                semantics. */}
            {/* eslint-disable jsx-a11y/no-interactive-element-to-noninteractive-role */}
            <canvas
              ref={canvasRef}
              width={SPECTRUM_WIDTH}
              height={SPECTRUM_HEIGHT}
              // Hide the OS pointer while steering by keyboard, so it doesn't
              // sit next to the sample cursor over the spectrum.
              style={kbSteering ? {cursor: 'none'} : undefined}
              tabIndex={0}
              role="application"
              aria-label="Color spectrum"
              aria-describedby="pixel-spectrum-keyboard-help"
              onKeyDown={handleSpectrumKeyDown}
              onPointerDown={e => {
                endKbSteering();
                e.currentTarget.setPointerCapture(e.pointerId);
                pick(e);
              }}
              onPointerMove={e => {
                endKbSteering();
                if (e.buttons & 1) {
                  pick(e);
                }
              }}
              // The pick is done when the press ends (a drag can refine the
              // color first); dismiss the picker.
              onPointerUp={() => setOpen(false)}
            />
            {/* eslint-enable jsx-a11y/no-interactive-element-to-noninteractive-role */}
            <div
              className={moduleStyles.spectrumCursor}
              style={{left: cursor.x, top: cursor.y}}
            />
          </div>
          <span
            id="pixel-spectrum-keyboard-help"
            className={moduleStyles.srOnly}
          >
            Use the arrow keys to move across the colors; hold Shift for bigger
            steps. The color updates as you move. Press Enter to keep it, or
            Escape to put the previous color back.
          </span>
          <div aria-live="polite" className={moduleStyles.srOnly}>
            {announcement}
          </div>
          <div className={moduleStyles.recentRow}>
            <button
              type="button"
              className={cx(
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
