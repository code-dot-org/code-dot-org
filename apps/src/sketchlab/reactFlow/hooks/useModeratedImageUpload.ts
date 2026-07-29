import {useCallback, useMemo, useState} from 'react';

import {useFlaggedImage} from '@cdo/apps/lab2/hooks/useFlaggedImage';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {unflagProjectChannel} from '@cdo/apps/lab2/redux/lab2ProjectReduxThunks';
import HttpClient from '@cdo/apps/util/HttpClient';
import {moderateImage} from '@cdo/apps/util/moderateImage';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import {SafeAndSupportedImageTypes} from '@cdo/generated-scripts/sharedConstants';

import {ImageNodeType, SketchLabNode} from '../types';
import {
  generateImageAssetUploadUrl,
  isStarterAssetOrExemplarUpload,
  uploadImageAsset,
} from '../utils/uploadImageAsset';

const UPLOADER_TYPE = 'SketchLab';

export interface ModeratedImageUploadRequest {
  file: File;
  // Receives the uploaded asset URL; add the image to the canvas here.
  // `flagged` is true when the user accepted a flagged moderation verdict —
  // record it on the node so deleting the node can lift the block later.
  onUploaded: (uploadUrl: string, flagged: boolean) => void;
  // Show the caller's error UX (banner, toast). Not called when the user
  // cancels a flagged upload — they answered the modal themselves.
  onError: () => void;
}

export type ModeratedImageUploader = (
  request: ModeratedImageUploadRequest
) => Promise<void>;

/**
 * Wraps uploadImageAsset with image moderation. Every student image upload
 * (toolbar, paste, backpack import) should go through uploadImage: it checks
 * the file against the moderation service before uploading, and on a flagged
 * verdict defers the upload until the user accepts via FlaggedImageModal
 * (accepting also flags the project's abuse score). The hosting view renders
 * the two modals from the returned state.
 *
 * Deleting a flagged image node undoes that acceptance: pass the deleted
 * nodes to handleImageNodesDeleted and it hard-deletes flagged assets from
 * storage and unflags the channel, mirroring weblab2's delete-file behavior.
 * Unflagged assets are left in storage.
 *
 * Start-mode and exemplar uploads (levelbuilder-authored) skip moderation.
 * A moderation service error fails open and uploads anyway.
 */
export function useModeratedImageUpload({levelName}: {levelName: string}) {
  const dispatch = useAppDispatch();
  // The lab slice is absent outside lab2 (e.g. the AI Tutor challenge
  // whiteboard), so guard the whole chain.
  const channelId = useAppSelector(state => state.lab?.channel?.id) ?? '';
  const isBlockedAbuse =
    useAppSelector(state => state.lab?.isBlockedAbuse) ?? false;

  const [showUploadsDisabledModal, setShowUploadsDisabledModal] =
    useState(false);

  const {
    flaggedImageData,
    onImageFlagged,
    handleAcceptFlaggedImage,
    handleCancelFlaggedImage,
  } = useFlaggedImage(UPLOADER_TYPE);

  const uploadImage: ModeratedImageUploader = useCallback(
    async ({file, onUploaded, onError}) => {
      const uploadToUrl = async (
        flagged: boolean,
        precomputedUploadUrl?: string
      ) => {
        const url = await uploadImageAsset(file, {
          levelName,
          channelId,
          precomputedUploadUrl,
        });
        if (url) {
          onUploaded(url, flagged);
        } else {
          onError();
        }
      };

      try {
        if (isStarterAssetOrExemplarUpload()) {
          // Levelbuilder-authored starter assets and exemplars are trusted;
          // skip moderation, matching other labs.
          await uploadToUrl(false);
          return;
        }

        if (!channelId) {
          onError();
          return;
        }

        if (isBlockedAbuse) {
          setShowUploadsDisabledModal(true);
          return;
        }

        // Only formats the moderation service accepts may be uploaded;
        // anything else would bypass moderation entirely.
        if (
          !(SafeAndSupportedImageTypes as readonly string[]).includes(file.type)
        ) {
          onError();
          return;
        }

        // Compute the destination before moderation so the flagged analytics
        // event can reference it and the deferred upload targets the same URL.
        const uploadUrl = generateImageAssetUploadUrl(file, {
          levelName,
          channelId,
        });
        const verdict = await moderateImage(file, 'sketchlab', {
          uploaderType: UPLOADER_TYPE,
          assetUrl: uploadUrl,
        });

        if (verdict === 'flagged') {
          const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
          // Deferred until the user accepts in FlaggedImageModal. Rethrow so
          // useFlaggedImage skips flagging the channel when the upload failed.
          onImageFlagged(file, fileExtension, async () => {
            try {
              await uploadToUrl(true, uploadUrl);
            } catch (error) {
              onError();
              throw error;
            }
          });
          return;
        }

        // 'safe', or 'error' when the moderation service is unavailable —
        // fail open and upload, matching other labs.
        await uploadToUrl(false, uploadUrl);
      } catch {
        onError();
      }
    },
    [channelId, isBlockedAbuse, levelName, onImageFlagged]
  );

  // Deleting a flagged image node removes the flagged content for good:
  // hard-delete the asset so undo/version restore can't resurrect it, then
  // unflag the channel (−15) if the project is currently blocked. The guard
  // mirrors weblab2's delete-file thunk and prevents double-unflagging when
  // an undo-restored copy of the node (now a dead reference) is re-deleted.
  const handleImageNodesDeleted = useCallback(
    async (deletedNodes: SketchLabNode[]) => {
      const flaggedImageNodes = deletedNodes.filter(
        (node): node is ImageNodeType =>
          node.type === 'image' && !!node.data.flagged
      );
      for (const node of flaggedImageNodes) {
        try {
          await HttpClient.delete(node.data.src);
          if (isBlockedAbuse && channelId) {
            await unflagProjectChannel(channelId, dispatch);
          }
        } catch (error) {
          // A failed delete just leaves an orphaned (still-blocked) asset.
          Lab2Registry.getInstance()
            .getMetricsReporter()
            .logError(
              'Error deleting flagged sketchlab image asset',
              error as Error
            );
        }
      }
    },
    [channelId, dispatch, isBlockedAbuse]
  );

  const closeUploadsDisabledModal = useCallback(
    () => setShowUploadsDisabledModal(false),
    []
  );

  return useMemo(
    () => ({
      uploadImage,
      handleImageNodesDeleted,
      flaggedImageData,
      handleAcceptFlaggedImage,
      handleCancelFlaggedImage,
      showUploadsDisabledModal,
      closeUploadsDisabledModal,
    }),
    [
      uploadImage,
      handleImageNodesDeleted,
      flaggedImageData,
      handleAcceptFlaggedImage,
      handleCancelFlaggedImage,
      showUploadsDisabledModal,
      closeUploadsDisabledModal,
    ]
  );
}
