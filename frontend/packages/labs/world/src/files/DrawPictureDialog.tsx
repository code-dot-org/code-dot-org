// A picture drawn from words, on its own, for a door that wants one and
// has no grid of pictures to put the asking under: the Actor Editor's look
// (specs/SHELL_FINISH_PLAN.md, step 4; `files/fileActs`, `draw`).
//
// The asking itself is `DescribePicture`, the panel the Actor Creator and
// the picture shelves already use. What this adds is the dialog round it,
// and the end of the errand: kept, the dialog closes and the door is told
// the file's name.

import {Typography} from '@mui/material';
import {useState} from 'react';

import {Dialog} from '@code-dot-org/component-library/dialog';

import {DescribePicture} from '../appearance/generate/DescribePicture';
import type {
  GeneratedPicture,
  ImageGenerator,
} from '../appearance/generate/imageGenerator';
import type {ImageKind} from '../appearance/generate/imagePrompts';

export interface DrawPictureDialogProps {
  /** Where pictures come from; nothing, and the dialog says so. */
  drawing?: ImageGenerator;
  /** A backdrop, or an actor's picture, which may be a thing or a surface. */
  background: boolean;
  /** Write it, and answer the file name it landed under. */
  onKeep: (picture: GeneratedPicture) => Promise<string | undefined>;
  /** Done: the kept file's name, or nothing when it was left. */
  onDone: (fileName: string | undefined) => void;
}

/** What an actor's picture may be; a backdrop is known by its folder. */
const ACTOR_KINDS: readonly ImageKind[] = ['thing', 'surface'];

export const DrawPictureDialog = ({
  drawing,
  background,
  onKeep,
  onDone,
}: DrawPictureDialogProps) => {
  const [kind, setKind] = useState<ImageKind>(
    background ? 'background' : 'thing',
  );
  return (
    <Dialog
      // A place to work in, not an alert (`RulesInPlayDialog`).
      role="dialog"
      title={background ? 'Draw a background' : 'Draw a picture'}
      onClose={() => onDone(undefined)}
      closeLabel="Close"
      // Keeping is the panel's own button; this one leaves without.
      primaryButtonProps={{
        children: 'Cancel',
        onClick: () => onDone(undefined),
      }}
      customContent={
        drawing ? (
          <DescribePicture
            drawing={drawing}
            kind={kind}
            kinds={background ? undefined : ACTOR_KINDS}
            onKind={setKind}
            placeholder={
              background
                ? 'a cave lit by glowing mushrooms'
                : kind === 'thing'
                  ? 'a purple crab'
                  : 'mossy stone bricks'
            }
            onKeep={onKeep}
            onKept={fileName => onDone(fileName)}
          />
        ) : (
          <Typography variant="body3" component="p">
            Nothing here can draw a picture from words.
          </Typography>
        )
      }
    />
  );
};

export default DrawPictureDialog;
