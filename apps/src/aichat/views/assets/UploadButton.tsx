import {Button} from '@code-dot-org/component-library/button';
import React, {ChangeEvent, useCallback, useRef} from 'react';

import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import HttpClient, {NetworkError} from '@cdo/apps/util/HttpClient';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {ACCEPTED_FILE_TYPES, MAX_NUM_FILES} from '../../constants';
import aichatI18n from '../../locale';
import {
  addStagedFile,
  clearStagedFilesAlert,
  stagedFilesLimitExceeded,
  stagedFileUploadFinished,
} from '../../redux';

const UploadButton: React.FC = () => {
  const dispatch = useAppDispatch();
  const inputRef = useRef<HTMLInputElement>(null);
  const currentChannelId = useAppSelector(state => state.lab.channel?.id);
  const numStagedFiles = useAppSelector(
    state => state.aichat.stagedFiles.length
  );

  const onSelectFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) {
      return;
    }

    // Clear the alert, if any
    dispatch(clearStagedFilesAlert());

    const numAllowedFiles = MAX_NUM_FILES - numStagedFiles;

    if (files.length > numAllowedFiles) {
      dispatch(stagedFilesLimitExceeded());
    }

    const allowedFiles = Array.from(files)
      .slice(0, numAllowedFiles)
      .map<[string, string, File]>(file => [
        // Create a unique key for each upload in case the same file is uploaded more than once.
        `${file.name}-${Date.now()}`,
        file.name,
        file,
      ]);

    for (const [key, filename] of allowedFiles) {
      dispatch(addStagedFile({key, filename}));
    }

    for (const [key, filename, file] of allowedFiles) {
      try {
        await HttpClient.put(
          `/v3/assets/${currentChannelId}/${encodeURIComponent(filename)}`,
          file
        );
        dispatch(stagedFileUploadFinished({key, status: 'uploaded'}));
      } catch (error) {
        let status: 'sizeLimitExceeded' | 'uploadFailed' = 'uploadFailed';
        if (error instanceof NetworkError && error.response.status === 413) {
          status = 'sizeLimitExceeded';
        } else {
          status = 'uploadFailed';
          // Only log if not a size limit exceeded error
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
  };

  const onUploadClick = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.click();
      // Clear the value in case the same file is selected again.
      inputRef.current.value = '';
    }
  }, [inputRef]);

  return (
    <>
      <input
        type="file"
        id="file"
        ref={inputRef}
        style={{display: 'none'}}
        onChange={onSelectFile}
        accept={ACCEPTED_FILE_TYPES.join(',')}
        multiple
      />
      <Button
        text={aichatI18n.upload()}
        iconLeft={{iconName: 'upload'}}
        size="s"
        type="secondary"
        color="gray"
        onClick={onUploadClick}
        disabled={numStagedFiles >= MAX_NUM_FILES}
      />
    </>
  );
};

export default UploadButton;
