// Menu for picking the kind of new image to create.
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {
  ListItemIcon,
  ListItemText,
  Menu as MuiMenu,
  MenuItem as MuiMenuItem,
} from '@mui/material';
import React from 'react';

import {
  ImageKind,
  imageKindPhrase,
} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/types';

export type NewImageKind = ImageKind;

const sameKind = (a: NewImageKind, b: NewImageKind) =>
  a.imageType === b.imageType &&
  (a.imageType !== 'sprite' ||
    (a.subject ?? 'character') === (b.subject ?? 'character'));

export const NEW_KINDS: {
  label: string;
  iconName: string;
  kind: NewImageKind;
}[] = [
  {
    label: 'Character',
    iconName: 'face-smile',
    kind: {imageType: 'sprite', subject: 'character'},
  },
  {label: 'Background', iconName: 'image', kind: {imageType: 'background'}},
  {
    label: 'Object',
    iconName: 'key',
    kind: {imageType: 'sprite', subject: 'object'},
  },
  {label: 'Block', iconName: 'cube', kind: {imageType: 'block'}},
];

interface ImageKindMenuProps {
  id: string;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onPick: (kind: NewImageKind) => void;
  /** Optionally limit to one kind, with the others listed but disabled. */
  onlyKind?: NewImageKind;
  /** Names each item for a screen reader as "<action> a character". */
  action?: string;
}

const ImageKindMenu: React.FunctionComponent<ImageKindMenuProps> = ({
  id,
  anchorEl,
  onClose,
  onPick,
  onlyKind,
  action,
}) => (
  // The menu is rendered at the document's root, so it draws over the panels
  // beside the tab instead of being clipped by the tab's scroll box.
  <MuiMenu
    id={id}
    anchorEl={anchorEl}
    open={!!anchorEl}
    onClose={onClose}
    anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
    transformOrigin={{vertical: 'top', horizontal: 'right'}}
  >
    {NEW_KINDS.map(({label, iconName, kind}) => (
      <MuiMenuItem
        key={label}
        disabled={!!onlyKind && !sameKind(kind, onlyKind)}
        aria-label={
          action
            ? `${action} ${imageKindPhrase(kind.imageType, kind.subject)}`
            : undefined
        }
        onClick={() => {
          onClose();
          onPick(kind);
        }}
      >
        <ListItemIcon>
          <FontAwesomeV6Icon iconName={iconName} />
        </ListItemIcon>
        <ListItemText>{label}</ListItemText>
      </MuiMenuItem>
    ))}
  </MuiMenu>
);

export default ImageKindMenu;
