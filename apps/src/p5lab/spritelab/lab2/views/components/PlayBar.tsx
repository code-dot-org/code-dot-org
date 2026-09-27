import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton, IconButton as MuiIconButton} from '@mui/material';
import React, {useCallback, useEffect, useRef} from 'react';

import {useSetupBlockColor} from '@cdo/apps/blockly/utils/useSetupBlockColor';
import {getRunButtonSx} from '@cdo/apps/templates/runButtonSx';

import {ArrowSet, dispatchGameKey, GameKey} from '../playBar';

import moduleStyles from '../sprite-lab2-view.module.scss';

interface HoldKeyProps {
  gameKey: GameKey;
  label: string;
  /** A text button (Jump) rather than an icon button. */
  text?: string;
  children?: React.ReactNode;
}

// How long an activation with no press of its own (assistive technology's
// click) holds the key: long enough for the game's per-frame key polling.
const TAP_MS = 100;

/**
 * A button that holds a game key down for as long as it is pressed: from
 * pointer down to pointer up, or from Enter/Space down to up. A click with
 * neither (assistive technology) taps the key. The key is released if the
 * button goes away while held (Stop, or the set changing).
 */
const HoldKey: React.FunctionComponent<HoldKeyProps> = ({
  gameKey,
  label,
  text,
  children,
}) => {
  const held = useRef(false);
  // Set by a pointer or key press, so the click that follows one is not
  // taken for an assistive-technology activation.
  const pressed = useRef(false);
  const press = useCallback(() => {
    pressed.current = true;
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
      press();
    },
    // Focus must not stay on the button, where Space (a game key) would
    // activate it on every press; cancelling pointerdown does not keep it
    // off in every browser.
    onPointerUp: (e: React.PointerEvent<HTMLElement>) => {
      release();
      e.currentTarget.blur();
    },
    onPointerCancel: release,
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
      if (pressed.current) {
        pressed.current = false;
        return;
      }
      press();
      pressed.current = false;
      window.setTimeout(release, TAP_MS);
    },
    onBlur: release,
  };
  if (text) {
    return (
      <MuiButton
        variant="outlined"
        color="secondary"
        size="medium"
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
      size="medium"
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
  onPlay: (event: React.MouseEvent<HTMLElement>) => void;
  /** Absent when there is no editing view to return to. */
  onStop?: (event: React.MouseEvent<HTMLElement>) => void;
}

/**
 * The bar under the playspace: Play, or while playing, Stop and the arrow
 * buttons. The Play button follows the legacy lab's Run button, so it
 * takes the when-run block's color under an accessibility theme.
 */
const PlayBar: React.FunctionComponent<PlayBarProps> = ({
  playing,
  arrows,
  onPlay,
  onStop,
}) => {
  const setupBlockColor = useSetupBlockColor();
  if (!playing) {
    return (
      <MuiButton
        variant="contained"
        color="primary"
        size="medium"
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
          size="medium"
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
        <HoldKey gameKey="right" label="Right">
          <FontAwesomeV6Icon iconName="caret-right" />
        </HoldKey>
        {arrows === 'jump' ? (
          <HoldKey gameKey="up" label="Jump" text="Jump" />
        ) : (
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
