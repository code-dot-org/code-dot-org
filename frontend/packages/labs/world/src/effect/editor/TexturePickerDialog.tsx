import {
  Dialog,
  DialogTitle,
  List,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import {useMemo} from 'react';

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
 * thumbnail is the texture, and the hint explaining *why* a learner would
 * pick it lives next to it instead of being squeezed under the preview.
 *
 * Renders inline (`disablePortal` via the theme): portals would escape the
 * `data-notranslate` container.
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

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle className={styles.title}>
        {translate('Choose a test texture')}
      </DialogTitle>
      <List className={styles.list} disablePadding>
        {testTextures.map(texture => (
          <ListItemButton
            key={texture.id}
            selected={texture.id === selectedId}
            className={styles.option}
            onClick={() => {
              onSelect(texture.id);
              onClose();
            }}
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
            <ListItemText
              primary={translate(texture.label)}
              secondary={translate(texture.hint)}
            />
          </ListItemButton>
        ))}
      </List>
    </Dialog>
  );
}
