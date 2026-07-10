import React, {FC, useCallback, useEffect, useRef, useState} from 'react';

import styles from './video-recorder.module.scss';

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

interface VideoRecorderProps {
  onRecordingChange: (hasRecording: boolean) => void;
  recordedUrl: string | null;
  setRecordedUrl: React.Dispatch<React.SetStateAction<string | null>>;
  timeLimitSeconds?: number;
  disabled?: boolean;
}

const VideoRecorder: FC<VideoRecorderProps> = ({
  onRecordingChange,
  recordedUrl,
  setRecordedUrl,
  timeLimitSeconds = 30,
  disabled = false,
}) => {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(timeLimitSeconds);

  const previewRef = useRef<HTMLVideoElement>(null);
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
        'Camera recording is not available on this page. ' +
          'Try opening the page over HTTPS.'
      );
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      streamRef.current = stream;
      if (previewRef.current) {
        previewRef.current.srcObject = stream;
      }
      setError(null);
    } catch {
      setError(
        'Camera or microphone access was denied. ' +
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

  const startRecording = () => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    setTimeRemaining(timeLimitSeconds);

    const recorder = new MediaRecorder(streamRef.current);
    recorder.ondataavailable = e => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, {type: 'video/webm'});
      setRecordedUrl(URL.createObjectURL(blob));
      onRecordingChange(true);
    };
    recorderRef.current = recorder;
    recorder.start();
    setRecordingState('recording');

    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
  };

  const reRecord = async () => {
    setRecordedUrl(null);
    setTimeRemaining(timeLimitSeconds);
    onRecordingChange(false);
    setRecordingState('idle');
    await startStream();
  };

  if (error) {
    return <p className={styles.error}>{error}</p>;
  }

  if (recordingState === 'recorded' && recordedUrl) {
    return (
      <div className={styles.container}>
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video className={styles.video} src={recordedUrl} controls />
        {!disabled && (
          <button
            type="button"
            className={styles.reRecordButton}
            onClick={reRecord}
          >
            Re-record
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.previewWrapper}>
        <video
          ref={previewRef}
          className={styles.video}
          autoPlay
          muted
          playsInline
        />
        {recordingState === 'recording' && (
          <CountdownRing
            timeRemaining={timeRemaining}
            timeLimitSeconds={timeLimitSeconds}
          />
        )}
      </div>
      {recordingState === 'idle' ? (
        <button
          type="button"
          className={styles.recordButton}
          onClick={startRecording}
        >
          Start Recording
        </button>
      ) : (
        <button
          type="button"
          className={styles.stopButton}
          onClick={stopRecording}
        >
          Stop Recording
        </button>
      )}
    </div>
  );
};

export default VideoRecorder;
