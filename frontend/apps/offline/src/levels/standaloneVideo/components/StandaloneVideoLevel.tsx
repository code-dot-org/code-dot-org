import React from 'react';

import Video from '@code-dot-org/component-library/video';

import type {LevelData} from '@/app/models/level';
import type {ActivitySectionData} from '@/app/models/unit';

import moduleStyles from './standaloneVideoLevel.module.scss';

export interface StandaloneVideoLevelProps {
  activitySection?: ActivitySectionData;
  level: LevelData;
}

const StandaloneVideoLevel: React.FunctionComponent<
  StandaloneVideoLevelProps
> = ({activitySection, level}) => {
  console.log(level);
  return (
    <div className={moduleStyles.standaloneVideoLevel}>
      <div>
        <Video
          youTubeId={level.videoData?.youTubeId}
          videoFallback={level.videoData?.download}
          isYouTubeCookieAllowed={true}
          showCaption
          videoTitle={activitySection?.title}
        />
      </div>
    </div>
  );
};

export default StandaloneVideoLevel;
