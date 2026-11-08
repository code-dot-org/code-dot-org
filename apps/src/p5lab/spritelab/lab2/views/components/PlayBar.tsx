import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton, IconButton as MuiIconButton} from '@mui/material';
import classNames from 'classnames';
import React, {useCallback, useEffect, useRef} from 'react';

import {useSetupBlockColor} from '@cdo/apps/blockly/utils/useSetupBlockColor';
import {getRunButtonSx} from '@cdo/apps/templates/runButtonSx';

import {ArrowSet, dispatchGameKey, GameKey} from '../playBar';

import moduleStyles from '../sprite-lab2-view.module.scss';

interface HoldKeyProps {
  gameKey: GameKey;
  label: string;
  className?: string;
  children?: React.ReactNode;
}

// A click with no press of its own (assistive technology) holds the key for
// TAP_MS and then TAP_FRAMES animation frames, so the game's per-frame key
// sampling sees it even when frames outlast the timer.
const TAP_MS = 100;
const TAP_FRAMES = 2;

const afterFrames = (count: number, fn: () => void): void => {
  if (count === 0) {
    fn();
  } else {
    window.requestAnimationFrame(() => afterFrames(count - 1, fn));
  }
};

/**
 * A button that holds a game key down for as long as it is pressed: from
 * pointer down to pointer up, or from Enter/Space down to up. A click with
 * neither (assistive technology) taps the key. The key is released if the
 * button goes away while held (Reset, or the set changing).
 */
const HoldKey: React.FunctionComponent<HoldKeyProps> = ({
  gameKey,
  label,
  className,
  children,
}) => {
  const held = useRef(false);
  // Set by a pointer press, whose click follows its release and must not be
  // taken for an assistive-technology activation. A key press cancels its
  // click, so it does not set this.
  const pointerPressed = useRef(false);
  // Counts presses, so a tap's timed release leaves a key that a later press
  // holds.
  const presses = useRef(0);
  const press = useCallback(() => {
    presses.current++;
    if (!held.current) {
      held.current = true;
      dispatchGameKey('keydown', gameKey);
    }
  }, [gameKey]);
  const release = useCallback(() => {
    if (held.current) {
      held.current = false;
      dispatchGameKey('keyup', gameKey);
    }
  }, [gameKey]);
  useEffect(() => release, [release]);

  const handlers = {
    // Act on the press itself, not the click that follows the release.
    onPointerDown: (e: React.PointerEvent<HTMLElement>) => {
      e.preventDefault();
      e.currentTarget.setPointerCapture?.(e.pointerId);
      pointerPressed.current = true;
      press();
    },
    // Focus must not stay on the button, where Space (a game key) would
    // activate it on every press; canceling pointerdown does not keep it
    // off in every browser.
    onPointerUp: (e: React.PointerEvent<HTMLElement>) => {
      release();
      e.currentTarget.blur();
    },
    onPointerCancel: () => {
      pointerPressed.current = false;
      release();
    },
    onLostPointerCapture: release,
    onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        press();
      }
    },
    onKeyUp: (e: React.KeyboardEvent<HTMLElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        release();
      }
    },
    onClick: () => {
      if (pointerPressed.current) {
        pointerPressed.current = false;
        return;
      }
      press();
      const tap = presses.current;
      window.setTimeout(() => {
        afterFrames(TAP_FRAMES, () => {
          if (presses.current === tap) {
            release();
          }
        });
      }, TAP_MS);
    },
    onBlur: release,
  };
  return (
    <MuiIconButton
      aria-label={label}
      className={classNames(moduleStyles.holdKey, className)}
      {...handlers}
    >
      {children}
    </MuiIconButton>
  );
};

interface ArrowCrossProps {
  arrows: ArrowSet;
}

/**
 * The four arrow buttons in a cross, shown while a scene with a player runs.
 * Under gravity the top one jumps; weightless, it steers up.
 */
export const ArrowCross: React.FunctionComponent<ArrowCrossProps> = ({
  arrows,
}) => {
  if (arrows === 'none') {
    return null;
  }
  return (
    <div className={moduleStyles.arrowCross}>
      <HoldKey
        gameKey="up"
        label={arrows === 'jump' ? 'Jump' : 'Up'}
        className={moduleStyles.arrowUp}
      >
        <FontAwesomeV6Icon iconName="chevron-up" />
      </HoldKey>
      <HoldKey gameKey="left" label="Left" className={moduleStyles.arrowLeft}>
        <FontAwesomeV6Icon iconName="chevron-left" />
      </HoldKey>
      <HoldKey
        gameKey="right"
        label="Right"
        className={moduleStyles.arrowRight}
      >
        <FontAwesomeV6Icon iconName="chevron-right" />
      </HoldKey>
      <HoldKey gameKey="down" label="Down" className={moduleStyles.arrowDown}>
        <FontAwesomeV6Icon iconName="chevron-down" />
      </HoldKey>
    </div>
  );
};

interface RunButtonsProps {
  playing: boolean;
  onPlay: (event: React.MouseEvent<HTMLElement>) => void;
  /** Absent when there is no editing view to return to. */
  onStop?: (event: React.MouseEvent<HTMLElement>) => void;
  /** Runs from the start scene, offered beside Run scene; absent on a level
      that keeps to one scene, whose one Run runs that scene. */
  onPlayGame?: (event: React.MouseEvent<HTMLElement>) => void;
  /** On the start scene Run scene and Run game are the same thing: one
      button, Run, which runs the game. */
  playSceneHidden?: boolean;
}

/**
 * The buttons of the bar under the stage: Run, or while playing, Reset. The
 * Run button follows the legacy lab's, so it takes the when-run block's
 * color under an accessibility theme; Reset is the legacy lab's purple.
 */
export const RunButtons: React.FunctionComponent<RunButtonsProps> = ({
  playing,
  onPlay,
  onStop,
  onPlayGame,
  playSceneHidden = false,
}) => {
  const setupBlockColor = useSetupBlockColor();
  if (playing) {
    return onStop ? (
      <MuiButton
        variant="contained"
        color="primary"
        size="small"
        startIcon={<FontAwesomeV6Icon iconName="rotate-right" />}
        onClick={onStop}
      >
        Reset
      </MuiButton>
    ) : null;
  }
  const playSceneAway = !!onPlayGame && playSceneHidden;
  return (
    <>
      {!playSceneAway && (
        <MuiButton
          variant="contained"
          color="primary"
          size="small"
          sx={getRunButtonSx(setupBlockColor)}
          startIcon={<FontAwesomeV6Icon iconName="play" />}
          onClick={onPlay}
        >
          {onPlayGame ? 'Run scene' : 'Run'}
        </MuiButton>
      )}
      {onPlayGame && (
        <MuiButton
          variant={playSceneAway ? 'contained' : 'outlined'}
          color={playSceneAway ? 'primary' : 'secondary'}
          size="small"
          sx={playSceneAway ? getRunButtonSx(setupBlockColor) : undefined}
          startIcon={
            <FontAwesomeV6Icon
              iconName={playSceneAway ? 'play' : 'flag-checkered'}
            />
          }
          onClick={onPlayGame}
        >
          {playSceneAway ? 'Run' : 'Run game'}
        </MuiButton>
      )}
    </>
  );
};

export default RunButtons;
