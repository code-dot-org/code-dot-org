import styles from './video.module.scss';

export interface FacadeProps {
  /** Facade poster thumbnail */
  posterThumbnail?: string;
  /** Facade onClick */
  onClick?: () => void;
  /** Facade alt text */
  alt: string;
  /** Called when the poster image fails to load */
  onError?: () => void;
}

const FacadeBackground = ({
  posterThumbnail,
  alt,
  onClick,
  onError,
}: FacadeProps) => {
  return (
    posterThumbnail && (
      <img
        onClick={onClick}
        className={styles.posterImage}
        src={posterThumbnail}
        loading={'lazy'}
        alt={alt}
        aria-hidden="true"
        onError={onError}
      />
    )
  );
};

export default FacadeBackground;
