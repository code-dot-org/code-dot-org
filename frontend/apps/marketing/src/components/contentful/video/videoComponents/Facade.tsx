import {styled} from '@mui/material/styles';

import FacadeBackground from './FacadeBackground';
import PlayButton from './PlayButton';

const MuiVideoFacade = styled('div', {
  name: 'MuiVideo',
  slot: 'facade',
})({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundSize: 'cover',
  backgroundPosition: 'center center',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

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
