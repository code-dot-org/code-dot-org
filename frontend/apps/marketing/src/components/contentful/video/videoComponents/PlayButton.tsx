import PlayArrow from '@mui/icons-material/PlayArrow';
import MuiButton from '@mui/material/Button';

const PlayButton = ({label, onClick}: {label: string; onClick: () => void}) => {
  return (
    <MuiButton
      aria-label={label}
      className="video-play-button"
      onClick={onClick}
      disableElevation
      disableRipple
    >
      <PlayArrow />
    </MuiButton>
  );
};

export default PlayButton;
