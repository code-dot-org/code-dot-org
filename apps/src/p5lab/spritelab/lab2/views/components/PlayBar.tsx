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

/**
 * A button that holds a game key down for as long as it is pressed: from
 * pointer down to pointer up, or from Enter/Space down to up. The key is
 * released if the button goes away while held (Stop, or the set changing).
 */
const HoldKey: React.FunctionComponent<HoldKeyProps> = ({
  gameKey,
  label,
  text,
  children,
}) => {
  const held = useRef(false);
  const press = useCallback(() => {
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
    // Cancelling the pointer default also keeps focus off the button, where
    // Space (a game key) would activate it on every press.
    onPointerDown: (e: React.PointerEvent<HTMLElement>) => {
      e.preventDefault();
      e.currentTarget.setPointerCapture?.(e.pointerId);
      press();
    },
    onPointerUp: release,
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
