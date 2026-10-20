import React from 'react';

import moduleStyles from '../sprite-lab2-view.module.scss';

interface PlayControlsProps {
  /** Absent on a pinned-scene level, where the game is the one scene. */
  onRestartGame?: (event: React.MouseEvent<HTMLElement>) => void;
  onRestartScene: (event: React.MouseEvent<HTMLElement>) => void;
}

/** The restart buttons shown over the play area while playing. */
const PlayControls: React.FunctionComponent<PlayControlsProps> = ({
  onRestartGame,
  onRestartScene,
}) => (
  <>
    {onRestartGame && (
      <button
        type="button"
        className={moduleStyles.playControl}
        onClick={onRestartGame}
      >
        Restart game
      </button>
    )}
    <button
      type="button"
      className={moduleStyles.playControl}
      onClick={onRestartScene}
    >
      Restart scene
    </button>
  </>
);

export default PlayControls;
