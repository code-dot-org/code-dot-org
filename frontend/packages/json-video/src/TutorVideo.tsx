import {
  useEffect,
  useRef,
  useState,
  type DetailedHTMLProps,
  type FC,
  type HTMLAttributes,
} from 'react';

import './jsonVideoElement';

declare global {
  // A custom element's JSX typing has no module-syntax form.
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'json-video': DetailedHTMLProps<
        HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        src?: string;
        controls?: string | boolean;
        poster?: string;
        autoplay?: boolean;
      };
    }
  }
}

export interface TutorVideoProps {
  /** URL of the video JSON, or a `data:application/json,` URI. */
  href: string;
  /** Image shown in place of the player when the video fails to load. */
  errorPoster?: string;
}

/** A `<json-video>` with controls that swaps in a poster when loading fails. */
const TutorVideo: FC<TutorVideoProps> = ({href, errorPoster}) => {
  const videoRef = useRef<HTMLElement>(null);

  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) {
      return;
    }

    const handleVideoError = () => {
      setHasError(true);
    };

    const handleVideoSuccess = () => {
      setHasError(false);
    };

    videoElement.addEventListener('error', handleVideoError);
    videoElement.addEventListener('loadeddata', handleVideoSuccess);

    return () => {
      videoElement.removeEventListener('error', handleVideoError);
      videoElement.removeEventListener('loadeddata', handleVideoSuccess);
    };
  }, []);

  return (
    <json-video
      ref={videoRef}
      controls="true"
      src={href}
      {...(hasError && errorPoster
        ? {
            poster: errorPoster,
            'aria-label': 'The Video is Unavailable',
          }
        : {})}
    />
  );
};

export default TutorVideo;
