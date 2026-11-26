import {useEffect} from 'react';

import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {UploadImageFunction} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/imageGeneration';
import {repointAnimation} from '@cdo/apps/p5lab/spritelab/lab2/views/imageSave';
import useReclaimAsset, {
  fileOf,
} from '@cdo/apps/p5lab/spritelab/lab2/views/useReclaimAsset';
import {getStore} from '@cdo/apps/redux';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';

import {hasNewerPixels, makeSourcesPreparer} from './pendingUploads';

const reportedFailures = new Set<string>();

/**
 * Makes the project's saves upload the drawn pixels its images hold, so a
 * drawing is uploaded at most once per save.
 */
export default function useUploadDrawingsOnSave(
  channelId: string | undefined,
  uploadImage: UploadImageFunction | undefined
) {
  const dispatch = useAppDispatch();
  const reclaimAsset = useReclaimAsset();
  useEffect(() => {
    const manager = Lab2Registry.getInstance().getProjectManager();
    if (!channelId || !uploadImage || manager?.getChannelId() !== channelId) {
      return;
    }
    manager.setSourcesPreparer(
      makeSourcesPreparer({
        channelId,
        upload: uploadImage,
        onUploaded: (key, sourceUrl, revision, previousUrl) => {
          // The save can finish after the level has changed, when the store
          // holds another project's images, or after another picture has
          // replaced this one.
          const state = getStore().getState();
          if (
            state.lab.channel?.id !== channelId ||
            state.animationList.propsByKey[key]?.sourceUrl !== previousUrl
          ) {
            return;
          }
          repointAnimation(dispatch, key, {
            sourceUrl,
            // Pixels drawn while this upload ran stay marked for the next
            // save.
            ...(!hasNewerPixels(channelId, key, revision) && {
              pendingUpload: undefined,
            }),
          });
          if (previousUrl && fileOf(previousUrl) !== fileOf(sourceUrl)) {
            void reclaimAsset(previousUrl);
          }
        },
        onUploadFailed: (key, error, hadFile) => {
          // A failed upload is tried again on every save; it is reported once.
          if (reportedFailures.has(key)) {
            return;
          }
          reportedFailures.add(key);
          analyticsReporter.sendEvent(
            EVENTS.HOAI2026_IMAGE_UPLOAD_FAILED,
            {
              reason: error instanceof Error ? error.message : String(error),
              hadFile,
            },
            true
          );
        },
      })
    );
  }, [channelId, uploadImage, dispatch, reclaimAsset]);
}
