import Alert, {type AlertProps} from '@code-dot-org/component-library/alert';
import React from 'react';

import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {MAX_FILE_SIZE_MB, MAX_NUM_FILES} from '../../constants';
import aichatI18n from '../../locale';
import {
  clearStagedFilesAlert,
  removeStagedFile,
  stagedFileUploadFinished,
} from '../../redux';
import {ChatAsset} from '../../types';

import FilePreview from './FilePreview';

import styles from './staged-files-preview.module.scss';

const alerts = {
  uploadFailed: [aichatI18n.uploadFailedAlert(), 'danger'] as const,
  fileLimitExceeded: [
    aichatI18n.uploadFileLimitExceededAlert({maximum: MAX_NUM_FILES}),
    'warning',
  ] as const,
  sizeLimitExceeded: [
    aichatI18n.uploadSizeLimitExceededAlert({maximum: MAX_FILE_SIZE_MB}),
    'danger',
  ] as const,
} satisfies {[key: string]: [string, AlertProps['type']]};

interface StagedFilesPreviewProps {
  buildAssetUrl: (asset: ChatAsset) => string;
}

const StagedFilesPreview: React.FC<StagedFilesPreviewProps> = ({
  buildAssetUrl,
}) => {
  const dispatch = useAppDispatch();
  const stagedFiles = useAppSelector(state => state.aichat.stagedFiles);

  const [alertMessage, style] = useAppSelector(state => {
    if (!state.aichat.stagedFilesAlert) {
      return [];
    }

    return alerts[state.aichat.stagedFilesAlert];
  });

  if (stagedFiles.length === 0 && !alertMessage) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.row}>
        {stagedFiles.map(({key, asset, status}) => {
          const filename = asset.filename;
          return (
            <FilePreview
              key={key}
              type={filename.endsWith('.pdf') ? 'pdf' : 'image'}
              url={`${buildAssetUrl(asset)}?t=${key}`}
              filename={filename}
              isUploading={status === 'uploading'}
              onRemove={() => dispatch(removeStagedFile(key))}
              onLoadError={() => {
                dispatch(
                  stagedFileUploadFinished({key, status: 'uploadFailed'})
                );
                Lab2Registry.getInstance()
                  .getMetricsReporter()
                  .logError('Error loading staged file', undefined, {
                    asset,
                  });
              }}
            />
          );
        })}
      </div>
      {alertMessage && style && (
        <Alert
          type={style}
          text={alertMessage}
          size="xs"
          onClose={() => dispatch(clearStagedFilesAlert())}
        />
      )}
    </div>
  );
};

export default StagedFilesPreview;
