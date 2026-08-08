// The stock-effect picker, opened by the `(import…)` row on an effect dropdown.
//
// It lists the library in its teaching order (see stock/index.ts) and copies
// the chosen one into the project. What a learner needs to choose well is the
// same thing the library was written to provide: a name, a sentence saying what
// the effect does, and the knobs it offers — and, since an effect is a picture
// and not a word, the picture.
//
// Every row shows its shader's first frame, rendered on one shared sample image
// at the effect's own declared defaults — so what is shown is what importing
// gives rather than a flattering demo — and each on the sample IT declares
// (`testTexture`), which is the author's answer to what shows it best: a
// stand-in actor for the color effects, a checkerboard for the ones that warp.
//
// There is no untouched reference beside them, and there was: it made sense
// only while every row was forced onto one shared sample, where grayscale on a
// grey-ish checkerboard was indistinguishable from nothing happening. Shown on
// the sample it was written for, each effect is legible on its own.
//
// The rows are PICTURES, and only the one under the pointer or the keyboard
// runs. Two of the six effects are motion and nothing else, so a still is not
// enough on its own — but a live canvas per row is a WebGL context per row, and
// a browser lends out about eight before it starts dropping the oldest without
// saying so (`useEffectPreviews`). Animating opportunistically costs one
// context, however long the library grows, and asks the GPU for nothing at all
// while somebody is reading.

import {Button, Typography} from '@mui/material';
import {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react';

import {Dialog} from '@code-dot-org/component-library/dialog';

import styles from './importEffectDialog.module.css';
import {translate} from './localization';
import {PreviewCanvas} from './preview/PreviewCanvas';
import {STOCK_EFFECTS, type StockEffect} from './stock';
import {useEffectPreviews} from './useEffectPreviews';

/** Edge length of a row's preview, in CSS pixels. */
const PREVIEW_SIZE = 72;

export interface ImportEffectDialogProps {
  /** Chosen — copy this into the project. */
  onImport: (effect: StockEffect) => void;
  /** Dismissed without choosing. */
  onCancel: () => void;
}

export const ImportEffectDialog = ({
  onImport,
  onCancel,
}: ImportEffectDialogProps) => {
  // Picking a row selects it; `Import` is what commits. A click that copies a
  // file into the project the moment it lands is a decision made by the mouse,
  // and reading the next row down is how somebody decides they wanted that one.
  const [chosen, setChosen] = useState<StockEffect | null>(null);
  const documents = useMemo(
    () => STOCK_EFFECTS.map(effect => effect.document),
    [],
  );
  const ids = useMemo(() => STOCK_EFFECTS.map(effect => effect.id), []);
  const {previews, textures, canAnimate} = useEffectPreviews(documents, ids);
  // Which row is being LOOKED at — hovered, or focused by the keyboard. The one
  // that animates, and only while that is true.
  const [active, setActive] = useState<number | null>(null);
  // Whether the active row's canvas has drawn yet. Until it has, the still
  // stays on top of it: a canvas is transparent between being mounted and being
  // rendered into, and that gap is a frame of the dialog showing through where
  // the picture was — the flash this exists to remove. Reset by moving rows,
  // because the next canvas starts blank too.
  const [drawn, setDrawn] = useState(false);
  /**
   * Each row's picture: a 2D canvas, not an image.
   *
   * The fallback a row shows is the frame its live canvas was last on, and the
   * obvious way to keep one — encode a data URL, hand it to an `<img>` — puts
   * an asynchronous DECODE in the middle of an interaction. Swap the src and
   * take the GL canvas away in one commit and the browser may not have the
   * bitmap ready when that commit paints: the img draws nothing, the dialog
   * shows through, and the square flashes white. Intermittently, because
   * whether it is ready is timing and nothing else.
   *
   * Blitting into a canvas already on screen is synchronous. There is no
   * encode, no decode, and no frame in between for anything to be missing —
   * the race is gone rather than narrowed.
   */
  const pictures = useRef<Array<HTMLCanvasElement | null>>([]);
  const snapshotRef = useRef<((target: HTMLCanvasElement) => boolean) | null>(
    null,
  );

  /** Draw a row's committed still into its canvas — its picture until hovered. */
  const paintStill = (index: number, canvas: HTMLCanvasElement | null) => {
    pictures.current[index] = canvas;
    const still = previews[index]?.still;
    if (!canvas || !still || canvas.dataset.painted === still) {
      return;
    }
    canvas.dataset.painted = still;
    const image = new Image();
    // Asynchronous, but nowhere near an interaction: this is the picture the
    // row opens with, drawn once, long before anybody points at it.
    image.onload = () => {
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      canvas.getContext('2d')?.drawImage(image, 0, 0);
    };
    image.src = still;
  };

  /**
   * Point at a row, or at none.
   *
   * Leaving keeps the frame that was on screen: read off the GL canvas and
   * drawn into the row's own canvas, both synchronously, in the handler. The
   * live canvas is then removed in the same commit that reveals a picture which
   * is already there — nothing to wait for, so nothing to flash.
   */
  const show = (index: number | null) => {
    if (active !== null && active !== index) {
      // Leave behind the frame that was on screen, so the picture the parked
      // canvas uncovers is the one it was showing.
      const picture = pictures.current[active];
      if (picture) {
        snapshotRef.current?.(picture);
      }
    }
    setActive(index);
    setDrawn(false);
  };

  /** Where the parked canvas sits, and whether it is showing. */
  const listRef = useRef<HTMLUListElement>(null);
  const [parked, setParked] = useState<CSSProperties>({opacity: 0});
  useLayoutEffect(() => {
    const list = listRef.current;
    const picture = active === null ? null : pictures.current[active];
    if (!list || !picture) {
      // Faded out rather than unmounted — the layer stays, which is the whole
      // point. Left where it was, since nothing can see it.
      setParked(at => ({...at, opacity: 0}));
      return;
    }
    const to = picture.getBoundingClientRect();
    const from = list.getBoundingClientRect();
    // Unrounded: a row sits at a fractional offset, and rounding the parked
    // canvas to whole pixels moves it a pixel off the picture it is covering —
    // which is a visible nudge at the moment it appears.
    setParked({
      transform: `translate(${to.left - from.left}px, ${
        to.top - from.top + list.scrollTop
      }px)`,
      opacity: drawn ? 1 : 0,
    });
  }, [active, drawn]);

  // Stills are what the dialog is; without them it is the list it always was.
  const showPreviews = previews.some(preview => preview.still !== null);

  return (
    <Dialog
      // A picker, not an alert: `Dialog` declares `role="alertdialog"`, which
      // announces something that needs answering now. The prop spread lands
      // after it, so this is the role that reaches the DOM.
      role="dialog"
      title={translate('Add an effect')}
      description={translate(
        'Pick one to copy into your project. You can open it afterwards and change anything you like.',
      )}
      onClose={onCancel}
      closeLabel={translate('Close')}
      primaryButtonProps={{
        children: translate('Import'),
        disabled: chosen === null,
        onClick: () => chosen && onImport(chosen),
      }}
      secondaryButtonProps={{
        children: translate('Cancel'),
        onClick: onCancel,
      }}
      customContent={
        /* In the library's order, which is the order they teach in: the first
           is the one to read if you have never seen a shader. */
        <ul className={styles.list} ref={listRef}>
          {STOCK_EFFECTS.map((effect, index) => (
            <li key={effect.id}>
              <Button
                className={styles.effect}
                // The design system's own colors, so a row reads as the same
                // kind of thing as every other button on the site — and its
                // selected state is the one the system already has a look for.
                variant={chosen?.id === effect.id ? 'contained' : 'outlined'}
                color="secondary"
                size="small"
                fullWidth
                aria-pressed={chosen?.id === effect.id}
                onClick={() => setChosen(effect)}
                onDoubleClick={() => onImport(effect)}
                // Hover AND focus, because the keyboard is not a lesser way to
                // read this list: tabbing down it should show the same thing
                // moving the pointer down it does.
                onMouseEnter={() => show(index)}
                onMouseLeave={() => active === index && show(null)}
                onFocus={() => show(index)}
                onBlur={() => active === index && show(null)}
              >
                {showPreviews && (
                  // Decorative: the name and the description beside it already
                  // say what this is, and a canvas cannot be described better
                  // in words than the sentence already next to it.
                  //
                  // The still is an IMAGE and the live one a canvas, swapped in
                  // place at the same size so nothing shifts. Only the active
                  // row mounts a canvas, so only one WebGL context exists —
                  // and `ShaderPreview.dispose` hands it back, which is what
                  // makes swapping it from row to row safe.
                  // The two are STACKED, not swapped. Both occupy the one
                  // cell; the still is simply on top until the canvas has
                  // something in it, and gone the moment it has — so there is
                  // no frame showing neither, and no frame showing both (which
                  // would double up a translucent effect like `fade`).
                  <span aria-hidden="true" className={styles.preview}>
                    <canvas
                      ref={element => paintStill(index, element)}
                      className={styles.square}
                      style={{
                        width: PREVIEW_SIZE,
                        height: PREVIEW_SIZE,
                        opacity: active === index && drawn ? 0 : 1,
                      }}
                    />
                  </span>
                )}
                <span className={styles.words}>
                  <Typography component="span" variant="strong" color="inherit">
                    {effect.document.name}
                  </Typography>
                  <Typography component="span" variant="body4" color="inherit">
                    {effect.document.description}
                  </Typography>
                  {effect.document.parameters.length > 0 && (
                    // The knobs, named. Two effects can do similar things and
                    // differ entirely in what they let you control.
                    <Typography
                      component="span"
                      variant="body4"
                      color="inherit"
                    >
                      {translate('Knobs: {names}', {
                        names: effect.document.parameters
                          .map(parameter => parameter.name)
                          .join(', '),
                      })}
                    </Typography>
                  )}
                </span>
              </Button>
            </li>
          ))}
          {canAnimate && (
            // ONE canvas for the whole dialog, parked over the row being looked
            // at. Never created, destroyed or reparented by pointing at a row —
            // only moved and faded.
            //
            // Mounting one per row is the obvious build and is what flickered:
            // a WebGL canvas is a compositing layer, and Chrome tearing one
            // down repaints the stacking context around it. That is invisible
            // to anything reading canvas PIXELS — the picture underneath was
            // measured full and correct on every frame — because the artifact
            // is in what the compositor paints, not in what the canvas holds.
            <li aria-hidden="true" className={styles.parked} style={parked}>
              <PreviewCanvas
                className={styles.live}
                // Null when nothing is active: `useShaderPreview` stops its
                // loop and keeps the context, so resting costs no GPU and no
                // teardown.
                fragmentSource={
                  active === null
                    ? null
                    : (previews[active]?.fragmentSource ?? null)
                }
                // The active row's OWN sample, so promoting a row changes what
                // moves and not what it is a picture of.
                texture={active === null ? null : (textures[active] ?? null)}
                parameters={
                  active === null ? undefined : previews[active]?.parameters
                }
                size={PREVIEW_SIZE}
                onFirstFrame={() => setDrawn(true)}
                snapshotRef={snapshotRef}
                label=""
              />
            </li>
          )}
        </ul>
      }
    />
  );
};

export default ImportEffectDialog;
