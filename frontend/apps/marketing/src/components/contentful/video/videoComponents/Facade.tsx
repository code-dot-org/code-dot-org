import FacadeBackground from './FacadeBackground';
import PlayButton from './PlayButton';
import {MuiVideoFacade} from './styledMuiComponents';

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
    <MuiVideoFacade>
      <FacadeBackground
        posterThumbnail={posterThumbnail}
        alt={label}
        onClick={onClick}
      />
      <PlayButton label={label} onClick={onClick} />
    </MuiVideoFacade>
  );
};

export default Facade;
