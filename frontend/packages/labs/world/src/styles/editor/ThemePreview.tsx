// The theme, drawn on the real controls.
//
// Every keystroke in the editor re-reads the stock actors through the theme
// as it now stands and repaints them. That is affordable for the same reason
// the game can run a drawing routine every frame: a reading is a few hundred
// array pushes, and the expensive half — rasterizing — is a canvas the size of
// one control (specs/DRAWING.md).

import {useEffect, useRef} from 'react';

import {readDrawing} from '../../actors/preview/drawingReader';
import {LOOK} from '../../actors/stock/look';
import {paintDrawing} from '../../runtime/driver/paintDrawing';

import {PREVIEW_KINDS, previewFiles} from './previewFiles';
import styles from './styleEditor.module.css';

export interface ThemePreviewProps {
  /** The theme as it now stands, serialized — what the file would hold. */
  theme: string;
}

/** Nothing has a sprite here, so nothing asks for an image. */
const noImages = () => undefined;

export const ThemePreview = ({theme}: ThemePreviewProps) => {
  const holder = useRef<HTMLDivElement>(null);

  // What the controls are read AGAINST. A theme that expects a dark page and
  // one that expects a light one both look wrong on the other's, and neither
  // can say so in a style because no control paints the page.
  let page: string = LOOK.background;
  try {
    const tokens = (JSON.parse(theme) as {tokens?: Record<string, unknown>})
      .tokens;
    if (typeof tokens?.background === 'string') {
      page = tokens.background;
    }
  } catch {
    // Mid-edit. The previous page colour is a better answer than none.
  }

  useEffect(() => {
    const into = holder.current;
    if (!into) {
      return;
    }
    into.replaceChildren();
    const files = previewFiles(theme);
    for (const kind of PREVIEW_KINDS) {
      const drawing = readDrawing(files, `actors/${kind}`);
      if (!drawing) {
        continue;
      }
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(drawing.width));
      canvas.height = Math.max(1, Math.round(drawing.height));
      // The control's own size, in CSS pixels, so a Panel reads as bigger
      // than a Button exactly as it is.
      canvas.style.width = `${canvas.width}px`;
      canvas.style.height = `${canvas.height}px`;
      canvas.className = styles.swatchCanvas;
      // A label the drawing cannot carry: a canvas is opaque to a reader, so
      // every picture here says what it is (specs/UI_ACTORS.md).
      canvas.setAttribute('role', 'img');
      canvas.setAttribute('aria-label', `${kind} drawn in this theme`);
      const context = canvas.getContext('2d');
      if (context) {
        paintDrawing(context, drawing.commands, noImages);
      }
      into.appendChild(canvas);
    }
  }, [theme]);

  return (
    <div className={styles.preview}>
      {/* The page behind the controls, so a surface with a shadow has
          something to cast onto and a light theme is not read on a dark one. */}
      <div
        className={styles.previewStage}
        style={{background: page}}
        ref={holder}
      />
    </div>
  );
};
