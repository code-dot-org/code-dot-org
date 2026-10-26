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

import {Button as MuiButton, Typography} from '@mui/material';
import {useState} from 'react';

import SegmentedButtons from '@code-dot-org/component-library/segmentedButtons';

import styles from './describePicture.module.css';
import {
  DRAW_COUNT,
  type GeneratedPicture,
  type ImageGenerator,
} from './imageGenerator';
import {
  SAID,
  THROUGH_SAID,
  WAYS_SAID,
  type ImageKind,
  type TileWays,
} from './imagePrompts';
import {ScaleGrid, type TileScale} from './ScaleGrid';

export interface DescribePictureProps {
  /** Where pictures come from, or nothing — in which case this is nothing. */
  drawing?: ImageGenerator;
  /** What the picture is for — the answer, whoever it came from. */
  kind: ImageKind;
  /**
   * The kinds on offer, where the call site cannot tell which this is.
   *
   * A BACKDROP IS KNOWN BY ITS FOLDER and so is never asked about. A thing and
   * a surface are not: `player.png` and `ground.png` are both sprites, in the
   * same folder, and only the learner knows which is being drawn
   * (`generate/imagePrompts`). Absent, or a single kind, leaves the question
   * out — which is how the other two doors get this panel without a question
   * they already have the answer to.
   */
  kinds?: readonly ImageKind[];
  onKind?: (kind: ImageKind) => void;
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

/** How tall one copy is drawn in the repeated preview, in rem. */
const TILED = 6.5;

/**
 * How wide one copy is against its height: the picture's own, where it said.
 *
 * NOT THE GAME'S ANSWER, deliberately. What the actor will occupy is the tile
 * box it was asked for, and the `set scale` row stretches the picture into it
 * (`actors/create/actorLook.withScale`). This preview is for judging the
 * DRAWING — whether it is the right picture and whether it joins — and a
 * picture judged through a stretch is a picture judged as something else.
 */
const aspectOf = (
  picture: GeneratedPicture | undefined,
  shape: TileScale | undefined,
): number => {
  if (picture?.width && picture?.height) {
    return picture.width / picture.height;
  }
  return shape?.x && shape?.y ? shape.x / shape.y : 1;
};

export const DescribePicture = ({
  drawing,
  kind,
  kinds,
  onKind,
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
  /**
   * Which edges a surface has to meet, and whether part of it is see-through.
   *
   * THE PANEL'S OWN, unlike the kind and the size. Those are facts about what
   * is being made and the call site keeps them — the size becomes a `set scale`
   * row on the actor. These are only ever part of the ask, so nothing above
   * needs telling and nothing survives leaving the panel.
   *
   * Both start at the weaker promise. A surface that need not join is easier
   * art than one that must — asking for a seam nobody wanted costs the picture
   * its distinctive features — and solid is what most surfaces are.
   */
  const [ways, setWays] = useState<TileWays>('none');
  const [through, setThrough] = useState(false);
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
        surface: kind === 'surface' ? {ways, through} : undefined,
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

  /** Whether this picture is expected to have transparency in it. */
  const seeThrough = kind === 'thing' || (kind === 'surface' && through);

  return (
    <div className={styles.panel}>
      {onKind && kinds && kinds.length > 1 && (
        <div className={styles.field}>
          <Typography variant="body4">What is it?</Typography>
          <ul className={styles.kinds} aria-label="What it is">
            {kinds.map(one => (
              <li key={one} style={{display: 'contents'}}>
                <MuiButton
                  variant={one === kind ? 'contained' : 'outlined'}
                  color="secondary"
                  className={styles.kind}
                  aria-pressed={one === kind}
                  onClick={() => onKind(one)}
                >
                  <Typography
                    component="span"
                    variant="body3"
                    color="inherit"
                    className={styles.kindName}
                  >
                    {SAID[one].name}
                  </Typography>
                  <Typography
                    component="span"
                    variant="body4"
                    color="inherit"
                    className={styles.kindWhat}
                  >
                    {SAID[one].what}
                  </Typography>
                </MuiButton>
              </li>
            ))}
          </ul>
        </div>
      )}

      {kind === 'surface' && (
        <>
          <div className={styles.field} aria-label="Which way it joins up">
            <Typography variant="body4">Does it join up?</Typography>
            {/* The design system's segmented control, which is what a small
                set of mutually exclusive answers is. It carries the pressed
                state and the keyboard behaviour that four hand-rolled buttons
                had to be given one at a time. */}
            <SegmentedButtons
              size="s"
              selectedButtonValue={ways}
              onChange={value => setWays(value as TileWays)}
              buttons={(['none', 'across', 'up', 'both'] as const).map(one => ({
                value: one,
                label: WAYS_SAID[one].name,
              }))}
            />
            <Typography variant="body4" className={styles.wayWhat}>
              {WAYS_SAID[ways].what}
            </Typography>
          </div>

          <div className={styles.field} aria-label="How much of it is drawn">
            <Typography variant="body4">Is any of it see-through?</Typography>
            <SegmentedButtons
              size="s"
              selectedButtonValue={through ? 'through' : 'solid'}
              onChange={value => setThrough(value === 'through')}
              buttons={(['solid', 'through'] as const).map(one => ({
                value: one,
                label: THROUGH_SAID[one].name,
              }))}
            />
            <Typography variant="body4" className={styles.wayWhat}>
              {THROUGH_SAID[through ? 'through' : 'solid'].what}
            </Typography>
          </div>
        </>
      )}

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
        <MuiButton
          variant="outlined"
          color="secondary"
          className={styles.draw}
          disabled={!prompt.trim() || drawingNow}
          onClick={() => void draw()}
        >
          <Typography component="span" variant="body3" color="inherit">
            {drawingNow ? 'Drawing…' : drawn ? 'Draw again' : 'Draw'}
          </Typography>
        </MuiButton>
        {drawn && (
          <MuiButton
            variant="contained"
            color="secondary"
            className={styles.keep}
            onClick={() => void keep()}
          >
            <Typography component="span" variant="body3" color="inherit">
              Keep this one
            </Typography>
          </MuiButton>
        )}
        {onBack && (
          <MuiButton
            variant="text"
            color="secondary"
            size="small"
            className={styles.back}
            onClick={onBack}
          >
            <Typography component="span" variant="body4" color="inherit">
              Choose a picture instead
            </Typography>
          </MuiButton>
        )}
      </div>

      {failed !== undefined && (
        <Typography variant="body4" className={styles.problem}>
          {failed}
        </Typography>
      )}

      <div
        className={
          // A CHECKERBOARD WHERE THERE IS TRANSPARENCY TO SEE. On the flat
          // dark ground a see-through picture reads as a hole rather than as
          // a picture with a hole in it, which is the one thing the learner
          // asked for and the one thing they could not check.
          seeThrough ? `${styles.preview} ${styles.through}` : styles.preview
        }
      >
        {drawn && kind === 'surface' && ways !== 'none' ? (
          // SHOWN REPEATED, because one copy cannot be judged. A seam is
          // invisible in a single picture and obvious in nine, and the whole
          // promise of this kind is that there is no seam — so the preview
          // shows the promise rather than the picture, and `Draw again`
          // becomes a decision instead of a guess.
          <div
            className={styles.tiled}
            role="img"
            aria-label={`Drawn for “${prompt}”, shown repeated`}
            style={{
              backgroundImage: `url(${drawn.dataUrl})`,
              // REPEATED THE WAY IT WAS ASKED TO BE, so the preview shows the
              // promise that was made rather than one nobody made: a picture
              // meant to lie in a row, stacked up, would show a seam it was
              // never going to be asked for.
              backgroundRepeat:
                ways === 'across'
                  ? 'repeat-x'
                  : ways === 'up'
                    ? 'repeat-y'
                    : 'repeat',
              // …AT THE PICTURE'S OWN PROPORTIONS, which this used to guess
              // at from the shape that was asked for. The guess was made
              // before anything measured what came back, and it was wrong
              // whenever the provider's nearest offered shape differed from
              // the one asked for — 2:3 shown as 1:2 is a squashed picture,
              // and it was reported as one. The transports say what they drew
              // now (`generate/imageGenerator.GeneratedPicture`), so there is
              // nothing left to guess.
              //
              // The shape remains the fallback for a transport that does not
              // say, and a square for one that says nothing either way.
              backgroundSize: `${TILED * aspectOf(drawn, scale)}rem ${TILED}rem`,
            }}
          />
        ) : drawn ? (
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

      {drawn && kind === 'surface' && ways !== 'none' && (
        <Typography variant="body4" className={styles.repeated}>
          Shown repeated, so you can see where the copies meet.
        </Typography>
      )}
    </div>
  );
};

export default DescribePicture;
