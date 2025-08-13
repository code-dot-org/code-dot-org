import FacadeBackground from './FacadeBackground';
import PlayButton from './PlayButton';

import moduleStyles from './video.module.scss';

const Facade = ({
  label,
  posterThumbnail,
  onClick,
}: {
  label: string;
  posterThumbnail: string;
  onClick: () => void;
}) => {
  return (
    <div className={moduleStyles.facade}>
      <FacadeBackground
        posterThumbnail={posterThumbnail}
        alt={label}
        onClick={onClick}
      />
      <PlayButton label={label} onClick={onClick} />
    </div>
  );
};

export default Facade;
