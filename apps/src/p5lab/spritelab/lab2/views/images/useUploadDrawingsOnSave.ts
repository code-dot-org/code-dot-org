import {useEffect} from 'react';

import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {UploadImageFunction} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/imageGeneration';
import {repointAnimation} from '@cdo/apps/p5lab/spritelab/lab2/views/imageSave';
import useReclaimAsset, {
  fileOf,
} from '@cdo/apps/p5lab/spritelab/lab2/views/useReclaimAsset';
import {getStore} from '@cdo/apps/redux';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';

import {hasNewerPixels, makeSourcesPreparer} from './pendingUploads';

/**
 * Has the project's saves upload the drawn pixels its images hold, so a
 * drawing is uploaded once per save instead of on every pause.
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
          // The save can finish after the level has changed; the store then
          // holds another project's images.
          const state = getStore().getState();
          if (
            state.lab.channel?.id !== channelId ||
            !state.animationList.propsByKey[key]
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
      })
    );
  }, [channelId, uploadImage, dispatch, reclaimAsset]);
}
