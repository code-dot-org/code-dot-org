import {styled} from '@mui/material/styles';

export interface FacadeProps {
  /** Facade poster thumbnail */
  posterThumbnail?: string;
  /** Facade onClick */
  onClick?: () => void;
  /** Facade alt text */
  alt: string;
}

const MuiVideoPosterImage = styled('img', {
  name: 'MuiVideo',
  slot: 'posterImage',
})(() => ({
  height: '100%',
  width: '100%',
  objectFit: 'cover',
}));

const FacadeBackground = ({posterThumbnail, alt, onClick}: FacadeProps) => {
  return (
    posterThumbnail && (
      <MuiVideoPosterImage
        onClick={onClick}
        src={posterThumbnail}
        loading={'lazy'}
        alt={alt}
        aria-hidden="true"
      />
    )
  );
};

export default FacadeBackground;
