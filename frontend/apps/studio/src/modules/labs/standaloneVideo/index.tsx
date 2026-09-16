import {Box, Button} from '@mui/material';
import {visuallyHidden} from '@mui/utils';

import {Video} from '@code-dot-org/component-library/video';
import {useConsent} from '@code-dot-org/core/plugins/consent';
import {useLevelProperties} from '@code-dot-org/lab/contexts';

import type {LabEntrypointProps} from '@/modules/labs/router/getLabEntrypointByAppName';

import {VideoLevelDataSchema} from './schema';
import styles from './standaloneVideo.module.css';
import {youTubeIdFromEmbedUrl} from './youTubeId';

/**
 * Player for standalone_video levels. Wires a design-system Video to the
 * level's Rails-authored data, with a Continue button.
 */
export default function StandaloneVideo({onContinue}: LabEntrypointProps) {
  const {categories} = useConsent();
  const levelProperties = useLevelProperties();
  const name = levelProperties?.name;
  // displayName is not on the shared level type. It arrives through
  // .passthrough(), so it reaches the player untyped.
  const displayName =
    typeof levelProperties?.displayName === 'string'
      ? levelProperties.displayName
      : undefined;

  const parsedLevelData = VideoLevelDataSchema.safeParse(
    levelProperties?.levelData,
  );
  const levelData = parsedLevelData.success ? parsedLevelData.data : undefined;
  const youTubeId = youTubeIdFromEmbedUrl(levelData?.src);

  return (
    <div className={styles.container}>
      {/* video_full_width levels (the only kind today) hide the title in the
          legacy Haml too. This heading stays screen-reader only. The route
          head already sets the document title. */}
      <Box component="h1" sx={visuallyHidden}>
        {displayName ?? levelData?.name ?? name}
      </Box>
      <div className={styles.stage}>
        <div className={styles.videoBox}>
          {/* A level with no usable video leaves the box empty, as the lab2
              player does. Continue still works, so the student moves on.
              Video needs a real id: without one it builds a broken poster
              URL and shows a cookie-consent message that does not apply. */}
          {youTubeId && (
            <Video
              youTubeId={youTubeId}
              videoTitle={levelData?.name ?? displayName ?? name}
              videoFallback={levelData?.download}
              posterThumbnailFallback={levelData?.thumbnail}
              showCaption={false}
              isYouTubeCookieAllowed={categories.has('functional')}
            />
          )}
          {onContinue && (
            <Button
              variant="contained"
              className={styles.continueButton}
              onClick={onContinue}
            >
              Continue
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
