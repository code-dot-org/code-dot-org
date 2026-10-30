import FontAwesomeV6Icon from '@/fontAwesomeV6Icon/FontAwesomeV6Icon';

import moduleStyles from './video.module.scss';

const PlayButton = ({label, onClick}: {label: string; onClick: () => void}) => {
  return (
    <button
      aria-label={label}
      className={moduleStyles.playButtonBackground}
      onClick={onClick}
    >
      <FontAwesomeV6Icon className={moduleStyles.playButton} iconName="play" />
    </button>
  );
};

export default PlayButton;
