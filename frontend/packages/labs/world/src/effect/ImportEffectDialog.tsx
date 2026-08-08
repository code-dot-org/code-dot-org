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
// gives rather than a flattering demo. The first cell is that sample UNTOUCHED,
// because an effect is only legible against the thing it changed: grayscale on
// a grey-ish sample is indistinguishable from nothing happening until there is
// something to compare it to.
//
// The rows are PICTURES, and only the one under the pointer or the keyboard
// runs. Two of the six effects are motion and nothing else, so a still is not
// enough on its own — but a live canvas per row is a WebGL context per row, and
// a browser lends out about eight before it starts dropping the oldest without
// saying so (`useEffectPreviews`). Animating opportunistically costs one
// context, however long the library grows, and asks the GPU for nothing at all
// while somebody is reading.

import {Button, Typography} from '@mui/material';
import {useMemo, useState} from 'react';

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
  const {previews, texture, sampleStill, canAnimate} = useEffectPreviews(
    documents,
    ids,
  );
  // Which row is being LOOKED at — hovered, or focused by the keyboard. The one
  // that animates, and only while that is true.
  const [active, setActive] = useState<number | null>(null);
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
        <ul className={styles.list}>
          {showPreviews && (
            // The untouched sample, once, at the top: the reference every row
            // below is read against. Not a row — there is nothing to choose
            // here — so it is not in the list's tab order.
            <li className={styles.reference} aria-hidden="true">
              <img
                className={styles.square}
                src={sampleStill ?? undefined}
                alt=""
                style={{width: PREVIEW_SIZE, height: PREVIEW_SIZE}}
              />
              <Typography component="span" variant="body4">
                {translate('No effect — what each one below starts from.')}
              </Typography>
            </li>
          )}
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
                onMouseEnter={() => setActive(index)}
                onMouseLeave={() =>
                  setActive(current => (current === index ? null : current))
                }
                onFocus={() => setActive(index)}
                onBlur={() =>
                  setActive(current => (current === index ? null : current))
                }
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
                  <span aria-hidden="true" className={styles.preview}>
                    {canAnimate && active === index ? (
                      <PreviewCanvas
                        className={styles.live}
                        fragmentSource={previews[index]?.fragmentSource ?? null}
                        texture={texture}
                        parameters={previews[index]?.parameters}
                        size={PREVIEW_SIZE}
                        label=""
                      />
                    ) : (
                      <img
                        className={styles.square}
                        src={previews[index]?.still ?? undefined}
                        alt=""
                        style={{width: PREVIEW_SIZE, height: PREVIEW_SIZE}}
                      />
                    )}
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
        </ul>
      }
    />
  );
};

export default ImportEffectDialog;
