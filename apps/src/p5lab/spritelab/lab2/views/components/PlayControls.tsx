import {Button as MuiButton} from '@mui/material';
import React from 'react';

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
      <MuiButton
        variant="outlined"
        color="secondary"
        size="small"
        onClick={onRestartGame}
      >
        Restart game
      </MuiButton>
    )}
    <MuiButton
      variant="outlined"
      color="secondary"
      size="small"
      onClick={onRestartScene}
    >
      Restart scene
    </MuiButton>
  </>
);

export default PlayControls;
