import {TutorVideo as BaseTutorVideo} from '@code-dot-org/json-video';
import React from 'react';

import errorPosterImg from '@cdo/static/tutorVideo/tutor-video-did-not-load-2x.png';

interface TutorVideoProps {
  href: string;
}

// The poster lives in apps/static, so apps binds it here rather than the
// package shipping an image.
const TutorVideo: React.FC<TutorVideoProps> = ({href}) => (
  <BaseTutorVideo href={href} errorPoster={errorPosterImg} />
);

export default TutorVideo;
