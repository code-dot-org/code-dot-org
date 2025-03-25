import FontAwesomeV6Icon from '@/fontAwesomeV6Icon/FontAwesomeV6Icon';

import moduleStyles from './video.module.scss';

const PlayButton = ({label}: {label: string}) => {
  return (
    <button aria-label={label} className={moduleStyles.playButtonBackground}>
      <FontAwesomeV6Icon className={moduleStyles.playButton} iconName="play" />
    </button>
  );
};

export default PlayButton;
