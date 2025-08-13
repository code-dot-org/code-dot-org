import PlayCircleIcon from '@mui/icons-material/PlayCircle';

import moduleStyles from './video.module.scss';

const PlayButton = ({label, onClick}: {label: string; onClick: () => void}) => {
  return (
    <button
      aria-label={label}
      className={moduleStyles.playButtonBackground}
      onClick={onClick}
    >
      <PlayCircleIcon className={moduleStyles.playButton} />
    </button>
  );
};

export default PlayButton;
