import Alert from '@code-dot-org/component-library/alert';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {WithTooltip} from '@code-dot-org/component-library/tooltip';
import {StrongText} from '@code-dot-org/component-library/typography';
import classNames from 'classnames';
import React from 'react';

import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {MAX_FILE_SIZE_MB, MAX_NUM_FILES} from '../../constants';
import aichatI18n from '../../locale';
import {clearStagedFilesAlert, removeStagedFile} from '../../redux';

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
};

const StagedFilesPreview: React.FC = () => {
  const dispatch = useAppDispatch();
  const stagedFiles = useAppSelector(state => state.aichat.stagedFiles);
  const currentChannelId = useAppSelector(state => state.lab.channel?.id);

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
        {stagedFiles.map(({key, filename, status}) => {
          return (
            <FilePreview
              key={key}
              type={filename.endsWith('.pdf') ? 'pdf' : 'image'}
              url={`/v3/assets/${currentChannelId}/${encodeURIComponent(
                filename
              )}`}
              filename={filename}
              isLoading={status === 'uploading'}
              onRemove={() => dispatch(removeStagedFile(key))}
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

const FilePreview: React.FC<{
  type: 'pdf' | 'image';
  filename: string;
  url: string;
  isLoading: boolean;
  onRemove: () => void;
}> = ({type, filename, url, isLoading, onRemove}) => {
  return (
    <div
      className={styles[`preview-${type}`]}
      title={filename}
      style={
        !isLoading && type === 'image' ? {backgroundImage: `url('${url}')`} : {}
      }
    >
      {isLoading ? (
        <FontAwesomeV6Icon
          className={styles.topRightIcon}
          iconName={'circle-notch'}
          animationType={'spin'}
        />
      ) : (
        <WithTooltip
          tooltipProps={{
            tooltipId: 'close-button',
            direction: 'onTop',
            size: 'xs',
            text: aichatI18n.remove(),
            className: styles.closeTooltip,
          }}
          tooltipOverlayClassName={styles.closeTooltipOverlay}
        >
          <button
            className={classNames(
              styles.topRightIcon,
              styles.topRightIconClose
            )}
            type="button"
            onClick={onRemove}
          >
            <FontAwesomeV6Icon iconName={'circle-xmark'} />
          </button>
        </WithTooltip>
      )}
      {type === 'pdf' && (
        <>
          <div className={styles.fileIcon}>
            <FontAwesomeV6Icon iconName="file" />
          </div>
          <div className={styles.filenameContainer}>
            <StrongText>{filename}</StrongText>
            <span>PDF</span>
          </div>
        </>
      )}
    </div>
  );
};

export default StagedFilesPreview;
