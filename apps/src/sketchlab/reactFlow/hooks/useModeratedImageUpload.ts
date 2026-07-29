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
  skipModeration?: boolean;
  // `flagged` means the user accepted a flagged moderation verdict; record it
  // on the node so deleting the node can lift the abuse block.
  onUploaded: (uploadUrl: string, flagged: boolean) => void;
  onError: () => void;
}

export type ModeratedImageUploader = (
  request: ModeratedImageUploadRequest
) => Promise<void>;

/**
 * Wraps uploadImageAsset with image moderation: a flagged verdict defers the
 * upload until the user accepts via FlaggedImageModal (which also flags the
 * project). The hosting view renders the two modals from the returned state.
 */
export function useModeratedImageUpload({levelName}: {levelName: string}) {
  const dispatch = useAppDispatch();
  // The lab slice is absent outside lab2, so guard the whole chain.
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
    async ({file, skipModeration, onUploaded, onError}) => {
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
          // Levelbuilder-authored uploads are trusted; skip moderation.
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

        if (skipModeration) {
          await uploadToUrl(false);
          return;
        }

        // Formats the moderation service can't check would bypass moderation.
        if (
          !(SafeAndSupportedImageTypes as readonly string[]).includes(file.type)
        ) {
          onError();
          return;
        }

        // Computed before moderation so the analytics event and the deferred
        // upload share the same URL.
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
          // Rethrow so useFlaggedImage skips flagging the channel when the
          // upload fails.
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

        // 'safe', or 'error' (moderation unavailable): fail open and upload.
        await uploadToUrl(false, uploadUrl);
      } catch {
        onError();
      }
    },
    [channelId, isBlockedAbuse, levelName, onImageFlagged]
  );

  // Hard-delete flagged assets so undo/version restore can't resurrect them,
  // then unflag the channel.
  const handleImageNodesDeleted = useCallback(
    async (deletedNodes: SketchLabNode[]) => {
      const flaggedImageNodes = deletedNodes.filter(
        (node): node is ImageNodeType =>
          node.type === 'image' && !!node.data.flagged
      );
      for (const node of flaggedImageNodes) {
        try {
          await HttpClient.delete(node.data.src);
          // Only unflag if project is blocked for abuse, otherwise we are likely
          // working off a stale copy of the node.
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
