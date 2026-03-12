import FontAwesomeV6Icon, {
  FontAwesomeV6IconProps,
} from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {WithTooltip} from '@code-dot-org/component-library/tooltip';
import {IconButton as MuiIconButton} from '@mui/material';
import classNames from 'classnames';
import React, {useRef, useState} from 'react';

import {getClientApi} from '@cdo/apps/aichat/api/client';
import {AudioRecorder} from '@cdo/apps/util/AudioRecorder';

import styles from './styles.module.scss';

const unknownErrorMessage = 'An unknown error occurred.';

interface SpeechToTextButtonProps {
  onTranscribed: (text: string) => void;
  onRecordStart?: () => void;
}

const SpeechToTextButton: React.FC<SpeechToTextButtonProps> = ({
  onTranscribed,
  onRecordStart,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const recorderRef = useRef<AudioRecorder>(new AudioRecorder());

  const onStartRecording = async () => {
    try {
      setErrorMessage(undefined);
      const startState = await recorderRef.current.start();
      if (startState === 'Started') {
        setIsRecording(true);
        onRecordStart?.();
      } else {
        setErrorMessage(
          startState === 'Unsupported'
            ? 'Audio recording is not supported on your device.'
            : startState === 'PermissionDenied'
            ? 'Permission to access the microphone was denied.'
            : unknownErrorMessage
        );
      }
    } catch (error) {
      console.error(error);
      setErrorMessage(unknownErrorMessage);
    }
  };

  const onEndRecording = async () => {
    setIsRecording(false);
    setIsTranscribing(true);
    try {
      const audio = await recorderRef.current.stop();
      const aichatClientApi = await getClientApi();
      const text = await aichatClientApi.transcribeAudio(audio);
      setIsTranscribing(false);
      onTranscribed(text);
    } catch (error) {
      console.error(error);
      setErrorMessage(unknownErrorMessage);
    } finally {
      setIsTranscribing(false);
    }
  };

  const iconProps: FontAwesomeV6IconProps = isTranscribing
    ? {iconName: 'spinner-third', iconFamily: 'duotone', animationType: 'spin'}
    : {iconName: 'microphone'};

  if (!recorderRef.current?.canRecord()) {
    return null;
  }

  return (
    <div className={styles.row}>
      {errorMessage && (
        <div className={styles.iconContainer}>
          <WithTooltip
            tooltipProps={{
              size: 'xs',
              tooltipId: 'error-tooltip',
              text: errorMessage,
              direction: 'onLeft',
            }}
          >
            <FontAwesomeV6Icon
              className={styles.error}
              iconName="exclamation-circle"
            />
          </WithTooltip>
        </div>
      )}
      {isRecording && !isTranscribing && (
        <div className={styles.iconContainer}>
          <FontAwesomeV6Icon iconName={'waveform-lines'} />
        </div>
      )}
      <div className={styles.buttonContainer}>
        {isRecording && <div className={styles.ping} />}
        <MuiIconButton
          variant="outlined"
          size="extraSmall"
          onClick={isRecording ? onEndRecording : onStartRecording}
          disabled={isTranscribing}
          color={isRecording ? 'white' : 'secondary'}
          className={classNames(isRecording && styles.recording)}
        >
          <FontAwesomeV6Icon {...iconProps} />
        </MuiIconButton>
      </div>
    </div>
  );
};

export default SpeechToTextButton;
