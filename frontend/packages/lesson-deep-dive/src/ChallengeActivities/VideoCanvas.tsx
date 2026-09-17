import Konva from 'konva';
import {
  type Dispatch,
  type FC,
  type SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {Image as KonvaImage, Layer, Stage} from 'react-konva';

import styles from './video-canvas.module.scss';

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

// Crop rect (in source-video pixel space) that fills a targetWidth x
// targetHeight box without distorting the image — CSS's object-fit: cover,
// which Konva.Image has no equivalent for on its own.
function getCoverCrop(
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number,
) {
  const sourceRatio = sourceWidth / sourceHeight;
  const targetRatio = targetWidth / targetHeight;
  if (sourceRatio > targetRatio) {
    const width = sourceHeight * targetRatio;
    return {x: (sourceWidth - width) / 2, y: 0, width, height: sourceHeight};
  }
  const height = sourceWidth / targetRatio;
  return {x: 0, y: (sourceHeight - height) / 2, width: sourceWidth, height};
}

interface VideoCanvasProps {
  // Caller-controlled: flip this to start/stop the recording (e.g. from a
  // button in a parent component) rather than clicking a button here.
  isRecording: boolean;
  onRecordingChange: (hasRecording: boolean) => void;
  // Called when the recording stops on its own (countdown expiry), so the
  // caller can bring its `isRecording` state back in sync.
  onIsRecordingChange?: (isRecording: boolean) => void;
  recordedBlob: Blob | null;
  setRecordedBlob: Dispatch<SetStateAction<Blob | null>>;
  recordedAudioBlob: Blob | null;
  setRecordedAudioBlob: Dispatch<SetStateAction<Blob | null>>;
  timeLimitSeconds?: number;
  disabled?: boolean;
}

const VideoCanvas: FC<VideoCanvasProps> = ({
  isRecording,
  onRecordingChange,
  onIsRecordingChange,
  recordedBlob,
  setRecordedBlob,
  setRecordedAudioBlob,
  timeLimitSeconds = 30,
  disabled = false,
}) => {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(timeLimitSeconds);
  const [stageSize, setStageSize] = useState({width: 0, height: 0});
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  // A state-backed ref (rather than useRef) so the animation effect below
  // reruns when the Layer mounts — it unmounts/remounts across a re-record,
  // since it lives in the same conditional branch as the recorded-playback
  // view, and a plain ref wouldn't trigger that.
  const [layerNode, setLayerNode] = useState<Konva.Layer | null>(null);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const imageNodeRef = useRef<Konva.Image>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasStreamRef = useRef<MediaStream | null>(null);
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
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
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

  // Track the wrapper's rendered size so the stage — and thus the recorded
  // output — matches it exactly, at whatever size the surrounding layout
  // gives the 9/16 box.
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const {width, height} = entry.contentRect;
      setStageSize({width: Math.round(width), height: Math.round(height)});
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Redraws the video's current frame onto the stage every animation frame.
  // Mutating the image node directly (rather than through React state) keeps
  // this off the render path — re-rendering React 30-60 times a second to
  // update one node would be wasted work.
  useEffect(() => {
    const videoEl = videoRef.current;
    const imageNode = imageNodeRef.current;
    if (!layerNode || !videoEl || !imageNode) return;
    if (!stageSize.width || !stageSize.height) return;

    const anim = new Konva.Animation(() => {
      const {videoWidth, videoHeight} = videoEl;
      if (!videoWidth || !videoHeight) return;
      imageNode.setAttrs({
        image: videoEl,
        width: stageSize.width,
        height: stageSize.height,
        crop: getCoverCrop(
          videoWidth,
          videoHeight,
          stageSize.width,
          stageSize.height,
        ),
      });
    }, layerNode);
    anim.start();
    return () => {
      anim.stop();
    };
  }, [layerNode, stageSize]);

  useEffect(() => {
    if (!recordedBlob) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(recordedBlob);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [recordedBlob]);

  const stopRecording = useCallback(() => {
    clearTimer();
    recorderRef.current?.stop();
    audioRecorderRef.current?.stop();
    canvasStreamRef.current?.getTracks().forEach(t => t.stop());
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
    // Clearing recordedBlob (rather than setting recordingState) is what
    // switches back to the preview render so the stage and <video
    // ref={videoRef}> are mounted in time to receive it — recordingState
    // itself stays 'recorded' until the new recorder actually starts, since
    // changing it here would re-trigger the isRecording effect below mid-await
    // and race a second startRecording() against this one's stale stream.
    if (recordingState === 'recorded') {
      setRecordedBlob(null);
      setRecordedAudioBlob(null);
      onRecordingChange(false);
      await startStream();
    }
    // The Layer this canvas belongs to is non-listening (see below), so it
    // never grows a second, invisible hit-graph canvas — this query always
    // finds the one canvas actually being drawn to.
    const sceneCanvas = stageRef.current?.container().querySelector('canvas');
    if (!streamRef.current || !sceneCanvas) return;
    chunksRef.current = [];
    audioChunksRef.current = [];
    setTimeRemaining(timeLimitSeconds);

    const canvasStream = sceneCanvas.captureStream(30);
    canvasStreamRef.current = canvasStream;
    const combinedStream = new MediaStream([
      ...canvasStream.getVideoTracks(),
      ...streamRef.current.getAudioTracks(),
    ]);

    const recorder = new MediaRecorder(combinedStream);
    recorder.ondataavailable = e => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, {type: 'video/webm'});
      setRecordedBlob(blob);
      onRecordingChange(true);
      onIsRecordingChange?.(false);
    };
    recorderRef.current = recorder;

    // A second recorder on an audio-only view of the same stream, so we end
    // up with an audio/webm blob alongside the video/webm one, without
    // having to demux the composited video afterwards.
    const audioStream = new MediaStream(streamRef.current.getAudioTracks());
    const audioRecorder = new MediaRecorder(audioStream, {
      mimeType: pickAudioMimeType(),
    });
    audioRecorder.ondataavailable = e => {
      if (e.data.size > 0) audioChunksRef.current.push(e.data);
    };
    audioRecorder.onstop = () => {
      const blob = new Blob(audioChunksRef.current, {type: 'audio/webm'});
      setRecordedAudioBlob(blob);
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
    setRecordedBlob,
    setRecordedAudioBlob,
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

  if (recordingState === 'recorded' && previewUrl) {
    return (
      <div className={styles.container}>
        <div className={styles.previewWrapper}>
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video
            className={styles.video}
            src={previewUrl}
            controls
            key="playback"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.previewWrapper} ref={wrapperRef}>
        <video
          key="preview"
          ref={videoRef}
          className={styles.hiddenVideo}
          autoPlay
          muted
          playsInline
        />
        {stageSize.width > 0 && stageSize.height > 0 && (
          <Stage
            ref={stageRef}
            width={stageSize.width}
            height={stageSize.height}
          >
            {/* listening=false: nothing on this layer is draggable yet, and
                it keeps this the container's only canvas (see startRecording
                above, which captures whichever canvas it finds there). */}
            <Layer ref={setLayerNode} listening={false}>
              <KonvaImage ref={imageNodeRef} image={undefined} />
            </Layer>
          </Stage>
        )}
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

export default VideoCanvas;
