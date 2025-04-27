import React from 'react';

import Video from '@code-dot-org/component-library/video';

import type {LevelData} from '@/app/models/level';

import moduleStyles from './standaloneVideoLevel.module.scss';

export interface StandaloneVideoLevelProps {
  levelData: LevelData;
}

const StandaloneVideoLevel: React.FunctionComponent<
  StandaloneVideoLevelProps
> = ({levelData}) => {
  return (
    <div className={moduleStyles.standaloneVideoLevel}>
      <div>
        <Video
          youTubeId={levelData.videoData?.youTubeId}
          videoFallback={levelData?.videoData?.download}
          isYouTubeCookieAllowed={true}
        />
      </div>
    </div>
  );
};

export default StandaloneVideoLevel;
