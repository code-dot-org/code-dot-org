import PlayArrow from '@mui/icons-material/PlayArrow';
import MuiButton from '@mui/material/Button';

import moduleStyles from './video.module.scss';

const PlayButton = ({label, onClick}: {label: string; onClick: () => void}) => {
  return (
    <MuiButton
      aria-label={label}
      className="video-play-button"
      onClick={onClick}
      disableElevation
      disableRipple
    >
      <PlayArrow className={moduleStyles.playButton} />
    </MuiButton>
  );
};

export default PlayButton;
