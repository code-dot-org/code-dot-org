import FacadeBackground from '@/video/FacadeBackground';
import PlayButton from '@/video/PlayButton';

import moduleStyles from './video.module.scss';

const Facade = ({
  label,
  posterThumbnail,
  onClick,
  onPosterError,
}: {
  label: string;
  posterThumbnail: string;
  onClick: () => void;
  onPosterError?: () => void;
}) => {
  return (
    <div className={moduleStyles.facade}>
      <FacadeBackground
        posterThumbnail={posterThumbnail}
        alt={label}
        onClick={onClick}
        onError={onPosterError}
      />
      <PlayButton label={label} onClick={onClick} />
    </div>
  );
};

export default Facade;
