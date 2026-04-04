import {Video} from '@code-dot-org/component-library/video';

import {useLevelProperties} from '@code-dot-org/lab/contexts';
import type {StandaloneVideoLevelProperties} from '../../types';

import moduleStyles from './standaloneVideo.module.scss';

const StandaloneVideoLab = () => {
  const levelProperties = useLevelProperties<StandaloneVideoLevelProperties>();
  const youTubeId = levelProperties?.levelData?.src?.match(/embed\/([^/]+)/)?.[1];

  return (
    <div className={moduleStyles.labStandaloneVideo}>
      <div>
        {levelProperties && (
          <Video
            youTubeId={youTubeId}
            videoTitle={levelProperties?.levelData?.name}
            showCaption={true}
            videoFallback={levelProperties?.levelData?.download}
            isYouTubeCookieAllowed={true}
          />
        )}
      </div>
    </div>
  );
};

export default StandaloneVideoLab;
