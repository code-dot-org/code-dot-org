import React from 'react';

import Video from '@code-dot-org/component-library/video';
import type {ActivitySectionData} from '@code-dot-org/models/activitySections';
import type {LevelData} from '@code-dot-org/models/levels';

import moduleStyles from './standaloneVideoLevel.module.scss';

export interface StandaloneVideoLevelProps {
  activitySection?: ActivitySectionData;
  levelData: LevelData;
}

const StandaloneVideoLevel: React.FunctionComponent<
  StandaloneVideoLevelProps
> = ({activitySection, levelData}) => (
  <div className={moduleStyles.standaloneVideoLevel}>
    <div>
      <Video
        youTubeId={levelData.videoData?.youTubeId}
        videoFallback={levelData.videoData?.download}
        isYouTubeCookieAllowed={true}
        showCaption
        videoTitle={activitySection?.title}
      />
    </div>
  </div>
);

export default StandaloneVideoLevel;
