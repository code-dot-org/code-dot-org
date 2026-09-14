import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography} from '@mui/material';
import React, {FC, useCallback, useEffect, useRef, useState} from 'react';

import styles from './audio-recorder.module.scss';

type RecordingState = 'idle' | 'recording' | 'recorded';

const RING_RADIUS = 26;
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

interface CountdownRingProps {
  timeRemaining: number;
  timeLimitSeconds: number;
}

const CountdownRing: FC<CountdownRingProps> = ({
  timeRemaining,
  timeLimitSeconds,
}) => {
  const progress = timeLimitSeconds > 0 ? timeRemaining / timeLimitSeconds : 0;
  const offset = CIRCUMFERENCE * (1 - progress);
  const color =
    timeRemaining <= 5
      ? '#ff4444'
      : timeRemaining <= 10
      ? '#ffd600'
      : '#ffffff';

  return (
    <div
      className={styles.countdownRing}
      aria-live="polite"
      aria-label={`${timeRemaining} seconds remaining`}
    >
      <svg
        className={styles.countdownRingSvg}
        viewBox="0 0 64 64"
        aria-hidden="true"
        style={{transform: 'rotate(-90deg)'}}
      >
        <circle
          cx="32"
          cy="32"
          r={RING_RADIUS}
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="3.5"
        />
        <circle
          cx="32"
          cy="32"
          r={RING_RADIUS}
          fill="none"
          stroke={color}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          style={{transition: 'stroke-dashoffset 1s linear, stroke 0.5s ease'}}
        />
      </svg>
      <span className={styles.countdownNumber} style={{color}}>
        {timeRemaining}
      </span>
    </div>
  );
};

// Prefer opus in a webm container; fall back to whatever the browser
// defaults to if that combination isn't supported.
function pickAudioMimeType(): string {
  return MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
    ? 'audio/webm;codecs=opus'
    : 'audio/webm';
}

interface AudioRecorderProps {
  // Caller-controlled: flip this to start/stop the recording (e.g. from a
  // button in a parent component) rather than clicking a button here.
  isRecording: boolean;
  onRecordingChange: (hasRecording: boolean) => void;
  // Called when the recording stops on its own (countdown expiry), so the
  // caller can bring its `isRecording` state back in sync.
  onIsRecordingChange?: (isRecording: boolean) => void;
  recordedUrl: string | null;
  setRecordedUrl: React.Dispatch<React.SetStateAction<string | null>>;
  timeLimitSeconds?: number;
  disabled?: boolean;
}

const AudioRecorder: FC<AudioRecorderProps> = ({
  isRecording,
  onRecordingChange,
  onIsRecordingChange,
  recordedUrl,
  setRecordedUrl,
  timeLimitSeconds = 30,
  disabled = false,
}) => {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(timeLimitSeconds);

  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = () => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startStream = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError(
        'Microphone recording is not available on this page. ' +
          'Try opening the page over HTTPS.'
      );
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({audio: true});
      streamRef.current = stream;
      setError(null);
    } catch {
      setError(
        'Microphone access was denied. ' +
          'Please allow access in your browser settings and try again.'
      );
    }
  }, []);

  useEffect(() => {
    startStream();
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
    // run once on mount; startStream is stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Revoke the object URL whenever it changes or on unmount.
  useEffect(() => {
    return () => {
      if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    };
  }, [recordedUrl]);

  const stopRecording = useCallback(() => {
    clearTimer();
    recorderRef.current?.stop();
    streamRef.current?.getTracks().forEach(t => t.stop());
    setRecordingState('recorded');
  }, []);

  // Auto-stop when the countdown expires.
  useEffect(() => {
    if (recordingState === 'recording' && timeRemaining === 0) {
      stopRecording();
    }
  }, [timeRemaining, recordingState, stopRecording]);

  const startRecording = useCallback(async () => {
    // Re-recording over a previous take: that stream's tracks were stopped
    // when the previous recording finished, so get a fresh one first.
    if (recordingState === 'recorded') {
      setRecordedUrl(null);
      onRecordingChange(false);
      await startStream();
    }
    if (!streamRef.current) return;
    chunksRef.current = [];
    setTimeRemaining(timeLimitSeconds);

    const recorder = new MediaRecorder(streamRef.current, {
      mimeType: pickAudioMimeType(),
    });
    recorder.ondataavailable = e => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, {type: 'audio/webm'});
      setRecordedUrl(URL.createObjectURL(blob));
      onRecordingChange(true);
      onIsRecordingChange?.(false);
    };
    recorderRef.current = recorder;

    recorder.start();
    setRecordingState('recording');

    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
  }, [
    recordingState,
    startStream,
    timeLimitSeconds,
    setRecordedUrl,
    onRecordingChange,
    onIsRecordingChange,
  ]);

  // Start or stop in response to the caller flipping `isRecording`, rather
  // than from a button owned by this component. Flipping it back on while
  // `recordingState` is 'recorded' re-records over the previous take.
  useEffect(() => {
    if (disabled) return;
    if (isRecording && recordingState !== 'recording') {
      startRecording();
    } else if (!isRecording && recordingState === 'recording') {
      stopRecording();
    }
  }, [isRecording, recordingState, disabled, startRecording, stopRecording]);

  if (error) {
    return <p className={styles.error}>{error}</p>;
  }

  if (recordingState === 'recorded' && recordedUrl) {
    return (
      <div className={styles.container}>
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <audio className={styles.audio} src={recordedUrl} controls />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.indicatorWrapper}>
        {isRecording && (
          <div className={styles.listeningChip}>
            <FontAwesomeV6Icon iconName="waveform-lines" iconStyle="solid" />
            <Typography variant="strong">Listening</Typography>
            {recordingState === 'recording' && (
              <CountdownRing
                timeRemaining={timeRemaining}
                timeLimitSeconds={timeLimitSeconds}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioRecorder;
