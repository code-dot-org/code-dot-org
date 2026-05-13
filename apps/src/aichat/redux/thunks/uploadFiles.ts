import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import HttpClient, {NetworkError} from '@cdo/apps/util/HttpClient';
import {moderateImage} from '@cdo/apps/util/moderateImage';
import {createAppAsyncThunk} from '@cdo/apps/util/reduxHooks';

import {MAX_FILE_SIZE_MB, MAX_NUM_FILES} from '../../constants';
import {AssetSource, ChatAsset, UploadStatus} from '../../types';
import {
  addStagedFile,
  clearStagedFilesAlert,
  stagedFilesLimitExceeded,
  stagedFileUploadFinished,
  updateStagedFileAsset,
} from '../slice';

import {sendAnalytics} from './sendAnalytics';

interface LevelAssetUploadResponse {
  uuidFilename?: string;
}

export const uploadFiles = createAppAsyncThunk<
  void,
  {
    files: File[];
    buildAssetUrl: (asset: ChatAsset) => string;
    inlineOnly?: boolean;
    /** Callback invoked when an upload finishes. If provided, the in-chat alert UI will be hidden for non-successful uploads. */
    onUploadFinished?: (status: UploadStatus) => void;
  }
>(
  'aichat/uploadFiles',
  async (
    {files, buildAssetUrl, inlineOnly, onUploadFinished},
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
      .map<[string, ChatAsset, File]>(file => [
        // Create a unique key for each upload in case the same file is uploaded more than once.
        `${file.name}-${Date.now()}`,
        {filename: file.name, source: AssetSource.PROJECT},
        file,
      ]);

    if (inlineOnly) {
      let uploadSuccessCount = 0;
      let sizeLimitExceededCount = 0;
      let imageFlaggedCount = 0;
      let fileCountPdf = 0;
      let fileCountImage = 0;

      for (const [key, asset, file] of allowedFiles) {
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
          sizeLimitExceededCount += 1;
          notifyUploadFinished(key, 'sizeLimitExceeded');
          continue;
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

        const inlineDataBase64 = await fileToBase64(file);
        dispatch(
          addStagedFile({
            key,
            asset: {
              ...asset,
              inlineDataBase64,
              mimeType: file.type,
            },
            loaded: true,
          })
        );
        uploadSuccessCount += 1;
        notifyUploadFinished(key, 'uploaded');
      }

      dispatch(
        sendAnalytics(EVENTS.AICHAT_MULTIMODAL_UPLOAD_STAGED, {
          source: AssetSource.PROJECT,
          fileCountSuccess: uploadSuccessCount,
          fileCountFailureSizeLimitExceeded: sizeLimitExceededCount,
          fileCountFailureUnknownCause: 0,
          fileCountFailureNumberExceeded: Math.max(excessFileCount, 0),
          imageFlaggedNotStagedCount: imageFlaggedCount,
          fileCountImage,
          fileCountPdf,
        })
      );
      return;
    }

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
        const uploadUrl = buildAssetUrl(asset);
        if (uploadUrl.includes('/level_starter_assets/')) {
          const bodyData = new FormData();
          bodyData.append('files[]', file);
          const response = await HttpClient.post(uploadUrl, bodyData, true);
          let uploadResponse: LevelAssetUploadResponse | undefined;
          try {
            uploadResponse = (await response.json()) as LevelAssetUploadResponse;
          } catch {
            uploadResponse = undefined;
          }
          dispatch(
            updateStagedFileAsset({
              key,
              asset: {
                filename: uploadResponse?.uuidFilename || file.name,
                source: uploadResponse?.uuidFilename
                  ? AssetSource.LEVEL_UUID
                  : AssetSource.LEVEL,
              },
            })
          );
        } else {
          await HttpClient.put(uploadUrl, file);
        }
        uploadSuccessCount += 1;
        notifyUploadFinished(key, 'uploaded');
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

const fileToBase64 = async (file: File): Promise<string> => {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        reject(new Error('Failed to read file as data URL.'));
        return;
      }
      const base64 = result.split(',')[1];
      if (!base64) {
        reject(new Error('Failed to parse base64 data from data URL.'));
        return;
      }
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsDataURL(file);
  });
};
