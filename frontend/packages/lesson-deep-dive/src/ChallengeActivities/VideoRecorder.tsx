import {
  type Dispatch,
  type FC,
  type SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

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

// Prefer opus in a webm container; fall back to whatever the browser
// defaults to if that combination isn't supported.
function pickAudioMimeType(): string {
  return MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
    ? 'audio/webm;codecs=opus'
    : 'audio/webm';
}

interface VideoRecorderProps {
  // Caller-controlled: flip this to start/stop the recording (e.g. from a
  // button in a parent component) rather than clicking a button here.
  isRecording: boolean;
  onRecordingChange: (hasRecording: boolean) => void;
  // Called when the recording stops on its own (countdown expiry), so the
  // caller can bring its `isRecording` state back in sync.
  onIsRecordingChange?: (isRecording: boolean) => void;
  recordedUrl: string | null;
  setRecordedUrl: Dispatch<SetStateAction<string | null>>;
  recordedAudioUrl: string | null;
  setRecordedAudioUrl: Dispatch<SetStateAction<string | null>>;
  timeLimitSeconds?: number;
  disabled?: boolean;
}

const VideoRecorder: FC<VideoRecorderProps> = ({
  isRecording,
  onRecordingChange,
  onIsRecordingChange,
  recordedUrl,
  setRecordedUrl,
  recordedAudioUrl,
  setRecordedAudioUrl,
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
  const audioRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
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
          'Try opening the page over HTTPS.',
      );
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          aspectRatio: 0.5625, // 9/16
        },
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
          'Please allow access in your browser settings and try again.',
      );
    }
  }, []);

  useEffect(() => {
    startStream();
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
    // run once on mount; startStream is stable
  }, []);

  // Revoke the object URLs whenever they change or on unmount.
  useEffect(() => {
    return () => {
      if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    };
  }, [recordedUrl]);

  useEffect(() => {
    return () => {
      if (recordedAudioUrl) URL.revokeObjectURL(recordedAudioUrl);
    };
  }, [recordedAudioUrl]);

  const stopRecording = useCallback(() => {
    clearTimer();
    recorderRef.current?.stop();
    audioRecorderRef.current?.stop();
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
    // Clearing recordedUrl (rather than setting recordingState) is what
    // switches back to the preview render so the <video ref={previewRef}>
    // element is mounted in time to receive it — recordingState itself
    // stays 'recorded' until the new recorder actually starts, since
    // changing it here would re-trigger the isRecording effect below mid-await
    // and race a second startRecording() against this one's stale stream.
    if (recordingState === 'recorded') {
      setRecordedUrl(null);
      setRecordedAudioUrl(null);
      onRecordingChange(false);
      await startStream();
    }
    if (!streamRef.current) return;
    chunksRef.current = [];
    audioChunksRef.current = [];
    setTimeRemaining(timeLimitSeconds);

    const recorder = new MediaRecorder(streamRef.current);
    recorder.ondataavailable = e => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, {type: 'video/webm'});
      setRecordedUrl(URL.createObjectURL(blob));
      onRecordingChange(true);
      onIsRecordingChange?.(false);
    };
    recorderRef.current = recorder;

    // A second recorder on an audio-only view of the same stream, so we end
    // up with an audio/webm blob alongside the video/webm one, without
    // having to demux the video afterwards.
    const audioStream = new MediaStream(streamRef.current.getAudioTracks());
    const audioRecorder = new MediaRecorder(audioStream, {
      mimeType: pickAudioMimeType(),
    });
    audioRecorder.ondataavailable = e => {
      if (e.data.size > 0) audioChunksRef.current.push(e.data);
    };
    audioRecorder.onstop = () => {
      const blob = new Blob(audioChunksRef.current, {type: 'audio/webm'});
      setRecordedAudioUrl(URL.createObjectURL(blob));
    };
    audioRecorderRef.current = audioRecorder;

    recorder.start();
    audioRecorder.start();
    setRecordingState('recording');

    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
  }, [
    recordingState,
    startStream,
    timeLimitSeconds,
    setRecordedUrl,
    setRecordedAudioUrl,
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
        <div className={styles.previewWrapper}>
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video
            className={styles.video}
            src={recordedUrl}
            controls
            key="playback"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.previewWrapper}>
        <video
          key="preview"
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
    </div>
  );
};

export default VideoRecorder;
