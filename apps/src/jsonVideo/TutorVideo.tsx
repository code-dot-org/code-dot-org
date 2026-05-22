import React, {useEffect, useRef, useState} from 'react';

import errorPosterImg from '@cdo/static/tutorVideo/tutor-video-did-not-load-2x.png';

interface TutorVideoProps {
  href: string;
}

const TutorVideo: React.FC<TutorVideoProps> = ({href}) => {
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
      {...(hasError
        ? {
            poster: errorPosterImg,
            'aria-label': 'The Video is Unavailable',
          }
        : {})}
    />
  );
};

export default TutorVideo;
