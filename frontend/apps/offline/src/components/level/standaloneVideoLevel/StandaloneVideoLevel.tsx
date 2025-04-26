import React from 'react';

import Video from '@code-dot-org/component-library/video';

import moduleStyles from './standaloneVideoLevel.module.scss';

const StandaloneVideoLevel: React.FunctionComponent = ({
  youTubeId,
  download,
}) => {
  return (
    <div className={moduleStyles.standaloneVideoLevel}>
      <div>
        <Video
          youTubeId={youTubeId}
          videoFallback={download}
          isYouTubeCookieAllowed={true}
        />
      </div>
    </div>
  );
};

export default StandaloneVideoLevel;
