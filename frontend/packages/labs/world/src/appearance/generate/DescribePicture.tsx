// Asking for a picture in words, wherever the question comes up.
//
// TWO PLACES ASK IT and they ask the same thing: the Actor Creator's picture
// step, and the backdrop shelf. What differs is only what the picture is FOR —
// which decides how the words are asked and where the file lands — so that is
// a prop and everything else is here (`generate/imagePrompts`,
// specs/IMAGE_GENERATION.md).
//
// UNDER whatever offers the pictures a project already has, rather than beside
// it: describing one is another way of answering the same question, and the
// ones already there are the likelier answer.
//
// IT RENDERS NOTHING WHEN NOTHING CAN DRAW. A lab with no service behind it
// should look like a lab without the feature, not like one whose button fails
// — which is why the transport is chosen before any of this is offered
// (`generate/chooseImageGenerator`).

import {Typography} from '@mui/material';
import {useState} from 'react';

import styles from './describePicture.module.css';
import {
  DRAW_COUNT,
  type GeneratedPicture,
  type ImageGenerator,
} from './imageGenerator';
import type {ImageKind} from './imagePrompts';

export interface DescribePictureProps {
  /** Where pictures come from, or nothing — in which case this is nothing. */
  drawing?: ImageGenerator;
  /** What the picture is for, which is the call site's to know. */
  kind: ImageKind;
  /** What the field suggests, which is the only per-place wording. */
  placeholder?: string;
  /**
   * Keep this one: write it, and answer with the file name it landed under.
   *
   * The caller's, because writing a file is: what comes back from a generator
   * is bytes, and what the project holds is a file in a folder.
   */
  onKeep: (picture: GeneratedPicture) => Promise<string | undefined>;
  /** What the place that asked wants done with the file that landed. */
  onKept?: (fileName: string) => void;
}

export const DescribePicture = ({
  drawing,
  kind,
  placeholder = 'a purple crab',
  onKeep,
  onKept,
}: DescribePictureProps) => {
  const [prompt, setPrompt] = useState('');
  const [drawn, setDrawn] = useState<readonly GeneratedPicture[]>([]);
  const [drawingNow, setDrawingNow] = useState(false);
  const [failed, setFailed] = useState<string>();

  if (!drawing) {
    return null;
  }

  /**
   * Ask, and put what comes back where it can be looked at.
   *
   * The words are KEPT. The commonest second action is a small edit to the
   * prompt rather than a fresh thought, and a field that cleared itself would
   * make the second ask cost as much as the first.
   */
  const draw = async () => {
    if (!prompt.trim() || drawingNow) {
      return;
    }
    setDrawingNow(true);
    setFailed(undefined);
    try {
      setDrawn(
        await drawing.draw({prompt: prompt.trim(), kind, count: DRAW_COUNT}),
      );
    } catch (error) {
      // SAID, rather than an empty tray. A service that refuses a key or is
      // busy leaves a learner pressing a button that appears to do nothing,
      // and "nothing happened" is the one answer a door must never give.
      setDrawn([]);
      setFailed(
        error instanceof Error && error.message
          ? error.message
          : 'That did not work. Try again.',
      );
    } finally {
      setDrawingNow(false);
    }
  };

  const keep = async (picture: GeneratedPicture) => {
    const fileName = await onKeep(picture);
    if (fileName) {
      // Gone from the tray once it is in the project: it is one of the
      // pictures there now, and showing it in both places would be saying it
      // was two things. A write that refused leaves it to try again.
      setDrawn([]);
      onKept?.(fileName);
    }
  };

  return (
    <>
      <div className={styles.describe}>
        <Typography variant="body4">Or describe one:</Typography>
        <input
          className={styles.prompt}
          value={prompt}
          placeholder={placeholder}
          aria-label="Describe a picture"
          onChange={event => setPrompt(event.target.value)}
        />
        <button
          type="button"
          className={styles.draw}
          disabled={!prompt.trim() || drawingNow}
          onClick={() => void draw()}
        >
          <Typography variant="body3">
            {drawingNow ? 'Drawing…' : drawn.length > 0 ? 'Draw again' : 'Draw'}
          </Typography>
        </button>
      </div>
      {failed !== undefined && (
        <Typography variant="body4" className={styles.problem}>
          {failed}
        </Typography>
      )}
      {drawn.length > 0 && (
        <div className={styles.drawn}>
          <Typography variant="body4" className={styles.note}>
            Press it to keep it, or change the words and draw again.
          </Typography>
          <ul className={styles.tray}>
            {drawn.map(picture => (
              <li key={picture.dataUrl}>
                <button
                  type="button"
                  className={styles.picture}
                  aria-label={`Keep ${picture.name}`}
                  title={picture.name}
                  onClick={() => void keep(picture)}
                >
                  <img src={picture.dataUrl} alt="" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
};

export default DescribePicture;
