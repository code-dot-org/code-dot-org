// Asking for a picture in words — a view of its own, not a row under a grid.
//
// TWO PLACES ASK IT and they ask the same thing: the Actor Creator's picture
// step, and the backdrop shelf. What differs is what the picture is FOR, which
// decides how the words are asked and where the file lands, and whether a
// SHAPE is worth asking about at all (`generate/imagePrompts`).
//
// IT TOOK THE WHOLE PANEL because of what it grew. A prompt, a shape, and a
// picture big enough to judge do not fit under a grid of the project's own
// pictures, and the picture is the point: one chosen at thumbnail size is one
// nobody looked at, and the reason to wait half a minute is to see it. Leaving
// the grid is a press and coming back is a press, which is the trade — the
// pictures a project already has are still the likelier answer, so the way
// back is always on screen.
//
// ONE AT A TIME, and asking again is a press. Four was the fixture's habit and
// does not survive a real service: each is a call and a wait, and the next act
// is almost never "pick the best of four" but "that is close, but greener",
// which is an edit to the words (`generate/imageGenerator.DRAW_COUNT`).

import {Typography} from '@mui/material';
import {useState} from 'react';

import styles from './describePicture.module.css';
import {
  DRAW_COUNT,
  type GeneratedPicture,
  type ImageGenerator,
} from './imageGenerator';
import type {ImageKind} from './imagePrompts';
import {ScaleGrid, type TileScale} from './ScaleGrid';

export interface DescribePictureProps {
  /** Where pictures come from, or nothing — in which case this is nothing. */
  drawing?: ImageGenerator;
  /** What the picture is for, which is the call site's to know. */
  kind: ImageKind;
  /** What the field suggests, which is the only per-place wording. */
  placeholder?: string;
  /**
   * How many tiles the actor fills, when that is a question worth asking.
   *
   * An ACTOR's, and not a backdrop's: a backdrop is stretched over the
   * viewport and has no tiles to fill. Absent leaves the widget out, which is
   * how the backdrop shelf gets the same panel without a question that would
   * mean nothing there.
   */
  scale?: TileScale;
  onScale?: (scale: TileScale) => void;
  /**
   * What is drawn and not yet kept, for a caller that has its own way on.
   *
   * THE WIZARD HAS ONE, and that is the whole reason this exists: pressing
   * `Next` there is how a learner says "this is the picture", exactly as
   * pressing a tile in the grid is, and a drawn picture that needed a second
   * press first was one that got left behind — made, looked at, and not on the
   * actor (`actors/create/ActorCreator`). So the step above is told what is on
   * screen and keeps it on the way out. The backdrop shelf has no "on" to
   * press and does not ask.
   */
  onDrew?: (picture?: GeneratedPicture) => void;
  /** Back to the pictures the project already has. */
  onBack?: () => void;
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
  scale,
  onScale,
  onDrew,
  onBack,
  onKeep,
  onKept,
}: DescribePictureProps) => {
  const [prompt, setPrompt] = useState('');
  const [drawn, setDrawn] = useState<GeneratedPicture>();
  const [drawingNow, setDrawingNow] = useState(false);
  const [failed, setFailed] = useState<string>();

  if (!drawing) {
    return null;
  }

  /**
   * Ask, and put what came back where it can be looked at.
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
      const pictures = await drawing.draw({
        prompt: prompt.trim(),
        kind,
        count: DRAW_COUNT,
        shape: scale,
      });
      setDrawn(pictures[0]);
      onDrew?.(pictures[0]);
      if (pictures.length === 0) {
        setFailed('Nothing came back. Try again.');
      }
    } catch (error) {
      // SAID, rather than an empty panel. A service that refuses a key or is
      // busy leaves a learner pressing a button that appears to do nothing,
      // and "nothing happened" is the one answer a door must never give.
      setDrawn(undefined);
      onDrew?.(undefined);
      setFailed(
        error instanceof Error && error.message
          ? error.message
          : 'That did not work. Try again.',
      );
    } finally {
      setDrawingNow(false);
    }
  };

  const keep = async () => {
    if (!drawn) {
      return;
    }
    const fileName = await onKeep(drawn);
    if (fileName) {
      // Gone from the panel once it is in the project: it is one of the
      // pictures there now. A write that refused leaves it to try again.
      setDrawn(undefined);
      onDrew?.(undefined);
      onKept?.(fileName);
    }
  };

  return (
    <div className={styles.panel}>
      {onScale && scale && (
        <div className={styles.field}>
          <Typography variant="body4">How big is it?</Typography>
          <ScaleGrid value={scale} onChange={onScale} />
        </div>
      )}

      <label className={styles.field}>
        <Typography variant="body4">Describe it</Typography>
        <textarea
          className={styles.prompt}
          value={prompt}
          placeholder={placeholder}
          aria-label="Describe a picture"
          onChange={event => setPrompt(event.target.value)}
        />
      </label>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.draw}
          disabled={!prompt.trim() || drawingNow}
          onClick={() => void draw()}
        >
          <Typography variant="body3">
            {drawingNow ? 'Drawing…' : drawn ? 'Draw again' : 'Draw'}
          </Typography>
        </button>
        {drawn && (
          <button
            type="button"
            className={styles.keep}
            onClick={() => void keep()}
          >
            <Typography variant="body3" color="inherit">
              Keep this one
            </Typography>
          </button>
        )}
        {onBack && (
          <button type="button" className={styles.back} onClick={onBack}>
            <Typography variant="body4" color="inherit">
              Choose a picture instead
            </Typography>
          </button>
        )}
      </div>

      {failed !== undefined && (
        <Typography variant="body4" className={styles.problem}>
          {failed}
        </Typography>
      )}

      <div className={styles.preview}>
        {drawn ? (
          // The words are the description, so the alt is them: a reader who
          // cannot see it is told what was asked for, which is the only thing
          // anybody here knows about it.
          <img src={drawn.dataUrl} alt={`Drawn for “${prompt}”`} />
        ) : (
          <Typography
            variant="body4"
            className={drawingNow ? styles.waiting : styles.nothing}
          >
            {drawingNow
              ? 'Drawing — this takes a moment.'
              : 'What comes back will show here.'}
          </Typography>
        )}
      </div>
    </div>
  );
};

export default DescribePicture;
