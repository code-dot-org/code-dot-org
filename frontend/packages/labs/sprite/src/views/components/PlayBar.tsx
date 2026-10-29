import {Button as MuiButton, IconButton as MuiIconButton} from '@mui/material';
import {
  type FunctionComponent,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
} from 'react';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import {type ArrowSet, dispatchGameKey, type GameKey} from '../playBar';
import {getRunButtonSx} from '../runButtonSx';

import moduleStyles from '../sprite-lab2-view.module.scss';

interface HoldKeyProps {
  gameKey: GameKey;
  label: string;
  /** A text button (Jump) rather than an icon button. */
  text?: string;
  children?: ReactNode;
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
 * button goes away while held (Stop, or the set changing).
 */
const HoldKey: FunctionComponent<HoldKeyProps> = ({
  gameKey,
  label,
  text,
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
    onPointerDown: (e: PointerEvent<HTMLElement>) => {
      e.preventDefault();
      e.currentTarget.setPointerCapture?.(e.pointerId);
      pointerPressed.current = true;
      press();
    },
    // Focus must not stay on the button, where Space (a game key) would
    // activate it on every press; cancelling pointerdown does not keep it
    // off in every browser.
    onPointerUp: (e: PointerEvent<HTMLElement>) => {
      release();
      e.currentTarget.blur();
    },
    onPointerCancel: () => {
      pointerPressed.current = false;
      release();
    },
    onLostPointerCapture: release,
    onKeyDown: (e: KeyboardEvent<HTMLElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        press();
      }
    },
    onKeyUp: (e: KeyboardEvent<HTMLElement>) => {
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
  if (text) {
    return (
      <MuiButton
        variant="outlined"
        color="secondary"
        size="small"
        aria-label={label}
        className={moduleStyles.holdKey}
        {...handlers}
      >
        {text}
      </MuiButton>
    );
  }
  return (
    <MuiIconButton
      variant="outlined"
      color="secondary"
      size="small"
      aria-label={label}
      className={moduleStyles.holdKey}
      {...handlers}
    >
      {children}
    </MuiIconButton>
  );
};

interface PlayBarProps {
  playing: boolean;
  arrows: ArrowSet;
  onPlay: (event: MouseEvent<HTMLElement>) => void;
  /** Absent when there is no editing view to return to. */
  onStop?: (event: MouseEvent<HTMLElement>) => void;
  /** The when-run block's color (useSetupBlockColor), or null for the
      design-system orange. */
  setupBlockColor?: string | null;
}

/**
 * The bar under the playspace: Play, or while playing, Stop and the arrow
 * buttons. The Play button follows the legacy lab's Run button, so it
 * takes the when-run block's color under an accessibility theme.
 */
const PlayBar: FunctionComponent<PlayBarProps> = ({
  playing,
  arrows,
  onPlay,
  onStop,
  setupBlockColor = null,
}) => {
  if (!playing) {
    return (
      <MuiButton
        variant="contained"
        color="primary"
        size="small"
        sx={getRunButtonSx(setupBlockColor)}
        startIcon={<FontAwesomeV6Icon iconName="play" />}
        onClick={onPlay}
      >
        Play
      </MuiButton>
    );
  }
  return (
    <>
      {onStop && (
        <MuiButton
          variant="contained"
          color="primary"
          size="small"
          sx={getRunButtonSx(setupBlockColor)}
          startIcon={<FontAwesomeV6Icon iconName="stop" />}
          onClick={onStop}
        >
          Stop
        </MuiButton>
      )}
      <div className={moduleStyles.arrowKeys}>
        <HoldKey gameKey="left" label="Left">
          <FontAwesomeV6Icon iconName="caret-left" />
        </HoldKey>
        {arrows === 'jump' && <HoldKey gameKey="up" label="Jump" text="Jump" />}
        <HoldKey gameKey="right" label="Right">
          <FontAwesomeV6Icon iconName="caret-right" />
        </HoldKey>
        {arrows === 'steer' && (
          <>
            <HoldKey gameKey="up" label="Up">
              <FontAwesomeV6Icon iconName="caret-up" />
            </HoldKey>
            <HoldKey gameKey="down" label="Down">
              <FontAwesomeV6Icon iconName="caret-down" />
            </HoldKey>
          </>
        )}
      </div>
    </>
  );
};

export default PlayBar;
