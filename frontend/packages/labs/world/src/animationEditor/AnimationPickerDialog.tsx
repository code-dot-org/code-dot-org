// The animations, as a grid of them running.
//
// An animation is a thing that MOVES, and a menu of file names was the worst
// possible reading of that: `coinSpin.anim` and `coinFlip.anim` are a word
// apart and nothing alike, and neither name says which one is the two-frame
// blink and which is the eight-frame tumble. So each tile plays.
//
// The same grid the actors and the pictures now get (`actors/ActorPickerDialog`,
// `SpritePickerDialog`), with the two ways to get another in front of the ones
// you have — because noticing you want one more happens while you are looking
// at them.
//
// A TILE IS A FILE. A `.anim` holds several named animations and the file is
// what opens, so the tile plays the first of them: it is the one the editor
// opens on, and a tile that showed all of them would be a second grid inside
// the first.

import {Typography} from '@mui/material';
import {useEffect, useMemo, useRef, useState} from 'react';

import {Dialog} from '@code-dot-org/component-library/dialog';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import styles from './animationPickerDialog.module.css';
import type {AnimDef} from './animDocument';
import {drawFrame} from './drawFrame';
import {frameAt} from './playback';
import {durations} from './timing';

/** How big a tile's canvas is, square. */
const BOX = 64;

/** One animation file the project holds. */
export interface AnimationTile {
  /** What opening it means — the file to activate. */
  fileId: string;
  /** What it is called, which is what its blocks and dropdowns call it. */
  name: string;
  /** The first animation in the file, or nothing when it holds none. */
  animation?: AnimDef;
}

export interface AnimationPickerDialogProps {
  animations: readonly AnimationTile[];
  /** The project's pictures, decoded — what a frame draws. */
  images: Record<string, HTMLImageElement>;
  /** A locked level shows its animations and offers no way to change them. */
  readOnly?: boolean;
  /** Chosen — open this one in the editor. */
  onOpen: (fileId: string) => void;
  /** Make one from nothing, which asks for a name first. */
  onNew: () => void;
  /** Take one from the stock library — the same picker the blocks open. */
  onImport: () => void;
  onCancel: () => void;
}

/**
 * One animation, playing.
 *
 * Playing rather than still, and playing on its own rather than on hover: what
 * distinguishes two animations of the same sprite IS the motion, and a grid
 * where you have to hover each one to tell them apart is a grid you have to
 * search. Held for a reader who has asked for less motion — the first frame is
 * still the picture, so what they lose is the animation and not the tile.
 */
const Playing = ({
  animation,
  images,
}: {
  animation: AnimDef;
  images: Record<string, HTMLImageElement>;
}) => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [at, setAt] = useState(0);
  const times = useMemo(() => durations(animation), [animation]);
  const total = times.reduce((sum, ms) => sum + ms, 0);

  useEffect(() => {
    const still =
      total <= 0 ||
      animation.frames.length < 2 ||
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (still) {
      return;
    }
    const started = performance.now();
    let raf = 0;
    const step = () => {
      // Only when the FRAME changes, not on every animation frame: React bails
      // out of a state write that changes nothing, so a ten-frame animation
      // re-renders ten times a second rather than sixty.
      const now = frameAt(times, (performance.now() - started) % total);
      setAt(was => (was === now ? was : now));
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [animation, times, total]);

  const frame = animation.frames[Math.min(at, animation.frames.length - 1)];
  useEffect(() => {
    if (canvas.current && frame) {
      drawFrame(canvas.current, BOX, frame, images);
    }
  }, [frame, images]);

  return <canvas ref={canvas} style={{width: BOX, height: BOX}} />;
};

export const AnimationPickerDialog = ({
  animations,
  images,
  readOnly = false,
  onOpen,
  onNew,
  onImport,
  onCancel,
}: AnimationPickerDialogProps) => {
  const action = (
    key: string,
    icon: string,
    label: string,
    onClick: () => void,
  ) => (
    <li key={key}>
      <button
        type="button"
        className={`${styles.tile} ${styles.action}`}
        onClick={onClick}
      >
        <span className={styles.picture}>
          <FontAwesomeV6Icon iconName={icon} iconStyle="solid" />
        </span>
        <Typography variant="body4" className={styles.name}>
          {label}
        </Typography>
      </button>
    </li>
  );

  return (
    <Dialog
      // A picker, not an alert: `Dialog` declares `role="alertdialog"`, which
      // is for a warning that interrupts. This one is a place to choose from.
      role="dialog"
      title="Animations"
      description="Open one, or bring in another."
      onClose={onCancel}
      closeLabel="Close"
      primaryButtonProps={{children: 'Done', onClick: onCancel}}
      customContent={
        <div className={styles.body}>
          <ul className={styles.grid}>
            {!readOnly && action('import', 'download', 'Import', onImport)}
            {!readOnly && action('new', 'plus', 'New', onNew)}
            {animations.map(one => (
              <li key={one.fileId}>
                <button
                  type="button"
                  className={styles.tile}
                  aria-label={`Open ${one.name}`}
                  title={one.name}
                  onClick={() => onOpen(one.fileId)}
                >
                  <span className={styles.picture}>
                    {one.animation && one.animation.frames.length > 0 ? (
                      <Playing animation={one.animation} images={images} />
                    ) : (
                      <FontAwesomeV6Icon
                        iconName="film"
                        iconStyle="solid"
                        className={styles.blank}
                      />
                    )}
                  </span>
                  <Typography variant="body4" className={styles.name}>
                    {one.name}
                  </Typography>
                </button>
              </li>
            ))}
          </ul>
          {animations.length === 0 && (
            <Typography variant="body3" className={styles.empty}>
              This project has no animations yet.
            </Typography>
          )}
        </div>
      }
    />
  );
};

export default AnimationPickerDialog;
