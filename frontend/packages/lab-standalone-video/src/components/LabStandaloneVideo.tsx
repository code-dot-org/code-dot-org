import React from 'react';

import Video from '@code-dot-org/component-library/video';
import type {ActivitySection} from '@code-dot-org/models/activitySections';
import type {Level} from '@code-dot-org/models/levels';

import moduleStyles from './labStandaloneVideo.module.scss';

export interface LabStandaloneVideoProps {
  activitySection?: ActivitySection;
  levelData: Level;
}

const LabStandaloneVideo: React.FunctionComponent<
  LabStandaloneVideoProps
> = ({activitySection, levelData}) => (
  <div className={moduleStyles.labStandaloneVideo}>
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

export default LabStandaloneVideo;
