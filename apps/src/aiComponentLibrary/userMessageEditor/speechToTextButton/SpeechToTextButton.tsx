import FontAwesomeV6Icon, {
  FontAwesomeV6IconProps,
} from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {IconButton as MuiIconButton, Tooltip} from '@mui/material';
import classNames from 'classnames';
import React, {useRef, useState} from 'react';

import {getClientApi} from '@cdo/apps/aichat/api/client';
import {AudioRecorder} from '@cdo/apps/util/AudioRecorder';

import styles from './styles.module.scss';

const unknownErrorMessage = 'An unknown error occurred.';
const recordingTimeoutMs = 60000;

export interface SpeechToTextAnalytics {
  /** Amount of time the user spent recording audio. */
  recordTimeSeconds: number;
  /** Total amount of time from the start of recording to the end of transcription. */
  totalTimeSeconds: number;
  /** Whether the recording ended due to a timeout. */
  timedOut: boolean;
}

interface SpeechToTextButtonProps {
  onTranscribed: (text: string, analytics: SpeechToTextAnalytics) => void;
  onRecordStart?: () => void;
  onRecordEnd?: () => void;
  disabled?: boolean;
}

const SpeechToTextButton: React.FC<SpeechToTextButtonProps> = ({
  onTranscribed,
  onRecordStart,
  onRecordEnd,
  disabled,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const recorderRef = useRef<AudioRecorder>(new AudioRecorder());
  const startTimeRef = useRef<number>(Date.now());

  const onStartRecording = async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    try {
      setErrorMessage(undefined);
      const startState = await recorderRef.current.start();
      if (startState === 'Started') {
        setIsRecording(true);
        onRecordStart?.();
        startTimeRef.current = Date.now();
        timeoutRef.current = setTimeout(
          () => onEndRecording(true),
          recordingTimeoutMs
        );
      } else {
        setErrorMessage(
          startState === 'PermissionDenied'
            ? 'Permission to access the microphone was denied.'
            : unknownErrorMessage
        );
      }
    } catch (error) {
      console.error(error);
      setErrorMessage(unknownErrorMessage);
    }
  };

  const onEndRecording = async (timedOut = false) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsRecording(false);
    setIsTranscribing(true);
    try {
      const audio = await recorderRef.current.stop();
      const recordTimeSeconds = (Date.now() - startTimeRef.current) / 1000;

      const aichatClientApi = await getClientApi();
      const text = await aichatClientApi.transcribeAudio(audio);
      const totalTimeSeconds = (Date.now() - startTimeRef.current) / 1000;

      setIsTranscribing(false);
      onTranscribed(text, {recordTimeSeconds, totalTimeSeconds, timedOut});
    } catch (error) {
      console.error(error);
      setErrorMessage(unknownErrorMessage);
    } finally {
      setIsTranscribing(false);
      onRecordEnd?.();
    }
  };

  const iconProps: FontAwesomeV6IconProps = isTranscribing
    ? {iconName: 'spinner-third', iconFamily: 'duotone', animationType: 'spin'}
    : {iconName: 'microphone'};

  const canRecord = recorderRef.current?.canRecord();

  return (
    <div className={styles.row}>
      {errorMessage && (
        <div className={styles.iconContainer}>
          <Tooltip title={errorMessage} placement="left">
            <FontAwesomeV6Icon
              className={styles.error}
              iconName="exclamation-circle"
              aria-label={errorMessage}
            />
          </Tooltip>
        </div>
      )}
      {isRecording && !isTranscribing && (
        <div className={styles.iconContainer}>
          <FontAwesomeV6Icon
            className={styles.waveform}
            iconName={'waveform-lines'}
          />
        </div>
      )}
      <div className={styles.buttonContainer}>
        {isRecording && <div className={styles.ping} />}
        <Tooltip
          title={
            !canRecord
              ? 'Audio recording is not supported on your device.'
              : undefined
          }
          placement="left"
        >
          <div className={styles.flexContainer}>
            <MuiIconButton
              variant="outlined"
              size="extraSmall"
              onClick={isRecording ? () => onEndRecording() : onStartRecording}
              disabled={!canRecord || isTranscribing || disabled}
              color={isRecording ? 'white' : 'secondary'}
              className={classNames(isRecording && styles.recording)}
            >
              <FontAwesomeV6Icon {...iconProps} />
            </MuiIconButton>
          </div>
        </Tooltip>
      </div>
    </div>
  );
};

export default SpeechToTextButton;
