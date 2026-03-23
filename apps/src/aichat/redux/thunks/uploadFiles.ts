import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import HttpClient, {NetworkError} from '@cdo/apps/util/HttpClient';
import {createAppAsyncThunk} from '@cdo/apps/util/reduxHooks';

import {MAX_FILE_SIZE_MB, MAX_NUM_FILES} from '../../constants';
import {AssetSource, ChatAsset} from '../../types';
import {
  addStagedFile,
  clearStagedFilesAlert,
  stagedFilesLimitExceeded,
  stagedFileUploadFinished,
} from '../slice';

import {sendAnalytics} from './sendAnalytics';

export const uploadFiles = createAppAsyncThunk<
  void,
  {files: File[]; buildAssetUrl: (asset: ChatAsset) => string}
>(
  'aichat/uploadFiles',
  async ({files, buildAssetUrl}, {dispatch, getState}) => {
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

    for (const [key, asset] of allowedFiles) {
      dispatch(addStagedFile({key, asset}));
    }

    let uploadSuccessCount = 0;
    let sizeLimitExceededCount = 0;
    let uploadFailureCount = 0;
    let fileCountPdf = 0;
    let fileCountImage = 0;
    for (const [key, asset, file] of allowedFiles) {
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        sizeLimitExceededCount += 1;
        dispatch(
          stagedFileUploadFinished({
            key,
            status: 'sizeLimitExceeded',
          })
        );
        continue; // Skip uploading this file if it exceeds the size limit.
      }

      if (file.name.endsWith('.pdf')) {
        fileCountPdf += 1;
      } else {
        fileCountImage += 1;
      }

      try {
        await HttpClient.put(buildAssetUrl(asset), file);
        uploadSuccessCount += 1;

        dispatch(stagedFileUploadFinished({key, status: 'uploaded'}));
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

        dispatch(
          stagedFileUploadFinished({
            key,
            status,
          })
        );
      }
    }

    dispatch(
      sendAnalytics(EVENTS.AICHAT_MULTIMODAL_UPLOAD_STAGED, {
        source: AssetSource.PROJECT,
        fileCountSuccess: uploadSuccessCount,
        fileCountFailureSizeLimitExceeded: sizeLimitExceededCount,
        fileCountFailureUnknownCause: uploadFailureCount,
        fileCountFailureNumberExceeded: Math.max(excessFileCount, 0),
        fileCountImage,
        fileCountPdf,
      })
    );
  }
);
