import {Button, Typography} from '@mui/material';
import {useEffect, useMemo, useState} from 'react';

import {Dialog} from '@code-dot-org/component-library/dialog';

import {translate} from '../localization';
import {renderTestTexture, testTextures} from '../preview/testTextures';

import styles from './TexturePickerDialog.module.css';

export interface TexturePickerDialogProps {
  open: boolean;
  selectedId: string;
  onSelect: (textureId: string) => void;
  onClose: () => void;
}

/** Thumbnail edge length — big enough to tell the textures apart. */
const THUMBNAIL_SIZE = 56;

/**
 * The test-texture picker.
 *
 * A dialog rather than a dropdown so each choice can show itself: the
 * thumbnail is the texture, and the hint explaining *why* a learner would pick
 * it lives next to it instead of being squeezed under the preview.
 *
 * The design system's `Dialog`, so it is the same dialog as everywhere else on
 * the site — and it renders INLINE, where MUI's had to be talked out of
 * portalling (a portal mounts on `document.body`, outside the
 * `data-notranslate` container, and everything in here has been translated
 * already). It also brings the focus trap, the Escape handler and the close
 * button that the MUI one was never given.
 *
 * Choosing is deferred, as it is in the two import pickers: a row selects, and
 * `Use texture` commits. The dialog covers the previews it changes, so a click
 * that applied straight away would be a change you cannot see until the thing
 * that made it goes away.
 *
 * Mounted only while open: the dialog locks body scroll for as long as it
 * exists, so a closed one left in the tree would lock the page.
 */
export function TexturePickerDialog({
  open,
  selectedId,
  onSelect,
  onClose,
}: TexturePickerDialogProps) {
  // Thumbnails are procedural; draw them once, not on every open.
  const thumbnails = useMemo(
    () =>
      new Map(
        testTextures.map(texture => [
          texture.id,
          renderTestTexture(texture, THUMBNAIL_SIZE)?.toDataURL() ?? null,
        ]),
      ),
    [],
  );
  // Starts on whatever the previews are running on, so `Use texture` is never
  // the only thing standing between a learner and an empty choice.
  const [chosen, setChosen] = useState(selectedId);
  useEffect(() => setChosen(selectedId), [selectedId, open]);

  if (!open) {
    return null;
  }

  const use = (textureId: string) => {
    onSelect(textureId);
    onClose();
  };

  return (
    <Dialog
      // A picker, not an alert: `Dialog` declares `role="alertdialog"`, which
      // announces something that needs answering now. The prop spread lands
      // after it, so this is the role that reaches the DOM.
      role="dialog"
      title={translate('Choose a test texture')}
      description={translate(
        'Every preview in the editor runs on the picture you pick.',
      )}
      onClose={onClose}
      closeLabel={translate('Close')}
      primaryButtonProps={{
        children: translate('Use texture'),
        onClick: () => use(chosen),
      }}
      secondaryButtonProps={{
        children: translate('Cancel'),
        onClick: onClose,
      }}
      // Over the editor's own layers: the wire-drop picker sits at 1201 and the
      // parameter popover at 1301, and the design system's default is 1040.
      zIndex={1400}
      customContent={
        <ul className={styles.list}>
          {testTextures.map(texture => (
            <li key={texture.id}>
              <Button
                className={styles.option}
                // The design system's own colors, so a row reads as the same
                // kind of thing as every other button on the site.
                variant={texture.id === chosen ? 'contained' : 'outlined'}
                color="secondary"
                size="small"
                fullWidth
                aria-pressed={texture.id === chosen}
                onClick={() => setChosen(texture.id)}
                onDoubleClick={() => use(texture.id)}
              >
                {thumbnails.get(texture.id) && (
                  <img
                    className={styles.thumbnail}
                    src={thumbnails.get(texture.id) ?? undefined}
                    alt=""
                    width={THUMBNAIL_SIZE}
                    height={THUMBNAIL_SIZE}
                  />
                )}
                <span className={styles.text}>
                  <Typography component="span" variant="strong" color="inherit">
                    {translate(texture.label)}
                  </Typography>
                  <Typography component="span" variant="body4" color="inherit">
                    {translate(texture.hint)}
                  </Typography>
                </span>
              </Button>
            </li>
          ))}
        </ul>
      }
    />
  );
}
