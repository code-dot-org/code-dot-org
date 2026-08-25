import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import HttpClient, {NetworkError} from '@cdo/apps/util/HttpClient';
import {moderateImage} from '@cdo/apps/util/moderateImage';
import {createAppAsyncThunk} from '@cdo/apps/util/reduxHooks';
import {createUuid} from '@cdo/apps/utils';

import {MAX_FILE_SIZE_MB, MAX_NUM_FILES} from '../../constants';
import {AssetSource, ChatAsset, UploadStatus} from '../../types';
import {
  addStagedFile,
  clearStagedFilesAlert,
  stagedFilesLimitExceeded,
  stagedFileUploadFinished,
} from '../slice';

import {sendAnalytics} from './sendAnalytics';

// Strip characters not allowed in Codebridge project filenames.
// Replaces anything other than word chars or hyphens in the file name with an underscore.
// Extension will be valid since it is already validated in either file input's accept attribute
// or paste handler's mime-type filter.
const cleanUploadFilename = (name: string): string => {
  const lastDot = name.lastIndexOf('.');
  const hasExt = lastDot > 0;
  const base = hasExt ? name.slice(0, lastDot) : name;
  const ext = hasExt ? name.slice(lastDot) : '';
  const cleanBase = base.replace(/[^\w-]/g, '_');
  return `${cleanBase}${ext}`;
};

export const uploadFiles = createAppAsyncThunk<
  void,
  {
    files: File[];
    buildAssetUrl: (asset: ChatAsset) => string;
    /** Project the uploads are written to, recorded on each asset. */
    channelId?: string;
    /** Callback invoked when an upload finishes. If provided, the in-chat alert UI will be hidden for non-successful uploads. */
    onUploadFinished?: (status: UploadStatus) => void;
    /** Callback invoked after each successful asset upload with the asset and its resolved URL. */
    onAssetUploaded?: (asset: ChatAsset, assetUrl: string) => void;
  }
>(
  'aichat/uploadFiles',
  async (
    {files, buildAssetUrl, channelId, onUploadFinished, onAssetUploaded},
    {dispatch, getState}
  ) => {
    const notifyUploadFinished = (key: string, status: UploadStatus) => {
      dispatch(
        stagedFileUploadFinished({key, status, hideAlert: !!onUploadFinished})
      );
      onUploadFinished?.(status);
    };
    const numStagedFiles = getState().aichat.stagedFiles.length;
    const numAllowedFiles = MAX_NUM_FILES - numStagedFiles;

    // Clear the alert, if any.
    dispatch(clearStagedFilesAlert());

    const excessFileCount = files.length - numAllowedFiles;
    if (excessFileCount > 0) {
      dispatch(stagedFilesLimitExceeded());
    }

    const allowedFiles = Array.from(files)
      .slice(0, numAllowedFiles)
      .map<[string, ChatAsset, File]>(file => {
        const validFilename = cleanUploadFilename(file.name);
        const lastDot = validFilename.lastIndexOf('.');
        const ext = lastDot > 0 ? validFilename.slice(lastDot) : '';
        const bucketKey = `${createUuid()}${ext}`;
        return [
          `${validFilename}-${Date.now()}`,
          {
            filename: validFilename,
            source: AssetSource.PROJECT,
            bucketKey,
            channelId,
          },
          file,
        ];
      });

    for (const [key, asset] of allowedFiles) {
      dispatch(addStagedFile({key, asset}));
    }

    let uploadSuccessCount = 0;
    let sizeLimitExceededCount = 0;
    let uploadFailureCount = 0;
    let imageFlaggedCount = 0;
    let fileCountPdf = 0;
    let fileCountImage = 0;
    for (const [key, asset, file] of allowedFiles) {
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        sizeLimitExceededCount += 1;
        notifyUploadFinished(key, 'sizeLimitExceeded');
        continue; // Skip uploading this file if it exceeds the size limit.
      }

      if (file.name.endsWith('.pdf')) {
        fileCountPdf += 1;
      } else {
        const moderationResult = await moderateImage(file, 'aichat', {});
        if (moderationResult === 'flagged') {
          imageFlaggedCount += 1;
          notifyUploadFinished(key, 'imageFileFlagged');
          continue;
        }
        fileCountImage += 1;
      }

      try {
        const assetUrl = buildAssetUrl(asset);
        await HttpClient.put(assetUrl, file);
        uploadSuccessCount += 1;
        notifyUploadFinished(key, 'uploaded');
        onAssetUploaded?.(asset, assetUrl);
      } catch (error) {
        let status: 'sizeLimitExceeded' | 'uploadFailed' = 'uploadFailed';
        if (error instanceof NetworkError && error.response.status === 413) {
          sizeLimitExceededCount += 1;
          status = 'sizeLimitExceeded';
        } else {
          uploadFailureCount += 1;
          status = 'uploadFailed';
          // Only log if not a size limit exceeded error.
          Lab2Registry.getInstance()
            .getMetricsReporter()
            .logError('Error uploading asset', error as Error, {
              filename: file.name,
            });
        }
        notifyUploadFinished(key, status);
      }
    }

    dispatch(
      sendAnalytics(EVENTS.AICHAT_MULTIMODAL_UPLOAD_STAGED, {
        source: AssetSource.PROJECT,
        fileCountSuccess: uploadSuccessCount,
        fileCountFailureSizeLimitExceeded: sizeLimitExceededCount,
        fileCountFailureUnknownCause: uploadFailureCount,
        fileCountFailureNumberExceeded: Math.max(excessFileCount, 0),
        imageFlaggedNotStagedCount: imageFlaggedCount,
        fileCountImage,
        fileCountPdf,
      })
    );
  }
);
