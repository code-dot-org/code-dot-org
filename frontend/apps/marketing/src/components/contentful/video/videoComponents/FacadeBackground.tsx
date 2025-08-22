import {MuiVideoPosterImage} from './styledMuiComponents';

export interface FacadeProps {
  /** Facade poster thumbnail */
  posterThumbnail?: string;
  /** Facade onClick */
  onClick?: () => void;
  /** Facade alt text */
  alt: string;
}

const FacadeBackground = ({posterThumbnail, alt, onClick}: FacadeProps) => {
  return (
    posterThumbnail && (
      <MuiVideoPosterImage
        onClick={onClick}
        src={posterThumbnail}
        loading="lazy"
        alt={alt}
        aria-hidden="true"
      />
    )
  );
};

export default FacadeBackground;
