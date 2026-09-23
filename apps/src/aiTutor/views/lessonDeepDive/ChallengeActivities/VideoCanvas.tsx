import React, {
  Dispatch,
  FC,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {Image as KonvaImage, Layer, Stage} from 'react-konva';

import EditToolbar from './EditToolbar';

import styles from './video-canvas.module.scss';

// 'edit': live stage, recorder stopped — where decorations get placed before
// a take, and where a take is discarded to place more.
export type VideoCanvasMode = 'edit' | 'recording' | 'preview';

// Node types come through react-konva: konva itself is ESM-only, which this
// CommonJS-compiled package cannot import.
type StageNode = React.ElementRef<typeof Stage>;
type LayerNode = React.ElementRef<typeof Layer>;
type ImageNode = React.ElementRef<typeof KonvaImage>;

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
  targetHeight: number
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
  // Requested by the caller, driven from a button it owns rather than one
  // here. Only edit -> recording, recording -> preview and preview -> edit
  // have any effect.
  mode: VideoCanvasMode;
  onRecordingChange: (hasRecording: boolean) => void;
  // Called when the recording stops on its own (countdown expiry), so the
  // caller can bring the state backing `mode` in sync.
  onIsRecordingChange?: (isRecording: boolean) => void;
  recordedBlob: Blob | null;
  setRecordedBlob: Dispatch<SetStateAction<Blob | null>>;
  recordedAudioBlob: Blob | null;
  setRecordedAudioBlob: Dispatch<SetStateAction<Blob | null>>;
  timeLimitSeconds?: number;
  disabled?: boolean;
}

const VideoCanvas: FC<VideoCanvasProps> = ({
  mode,
  onRecordingChange,
  onIsRecordingChange,
  recordedBlob,
  setRecordedBlob,
  setRecordedAudioBlob,
  timeLimitSeconds = 30,
  disabled = false,
}) => {
  // Actual mode, set by effects when `mode` changes; can briefly lag it.
  const [currentMode, setCurrentMode] = useState<VideoCanvasMode>('edit');
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(timeLimitSeconds);
  const [stageSize, setStageSize] = useState({width: 0, height: 0});
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  // A state-backed ref (rather than useRef) so the animation effect below
  // reruns when the Layer mounts — it unmounts while the take plays back and
  // remounts on the way to 'edit', since it lives in the same conditional
  // branch as that playback view, and a plain ref wouldn't trigger that.
  const [layerNode, setLayerNode] = useState<LayerNode | null>(null);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const stageRef = useRef<StageNode>(null);
  const imageNodeRef = useRef<ImageNode>(null);
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

  // getUserMedia can resolve while the playback branch is still rendered, so
  // the handoff is done both there and whenever the live branch mounts.
  const attachStream = useCallback(() => {
    if (videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, []);

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
        video: {
          aspectRatio: 0.5625, // 9/16
        },
        audio: true,
      });
      streamRef.current = stream;
      attachStream();
      setError(null);
    } catch {
      setError(
        'Camera or microphone access was denied. ' +
          'Please allow access in your browser settings and try again.'
      );
    }
  }, [attachStream]);

  // The live <video> unmounts while the recorded take plays back, so it needs
  // the stream again on the way back to the stage.
  useEffect(() => {
    if (currentMode !== 'preview') {
      attachStream();
    }
  }, [currentMode, attachStream]);

  useEffect(() => {
    startStream();
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, [startStream]);

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

    let frame = requestAnimationFrame(function draw() {
      const {videoWidth, videoHeight} = videoEl;
      if (videoWidth && videoHeight) {
        imageNode.setAttrs({
          image: videoEl,
          width: stageSize.width,
          height: stageSize.height,
          crop: getCoverCrop(
            videoWidth,
            videoHeight,
            stageSize.width,
            stageSize.height
          ),
        });
        layerNode.draw();
      }
      frame = requestAnimationFrame(draw);
    });
    return () => cancelAnimationFrame(frame);
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

  // 'preview' is entered in onstop once the blob exists, not here — the
  // caller can't name a take it hasn't heard about yet. The effect below may
  // call this more than once meanwhile; the guard settles it.
  const stopRecording = useCallback(() => {
    if (recorderRef.current?.state !== 'recording') return;
    clearTimer();
    recorderRef.current.stop();
    audioRecorderRef.current?.stop();
    canvasStreamRef.current?.getTracks().forEach(t => t.stop());
    // Frees the camera for the duration of the playback; `returnToEdit` asks
    // for it again.
    streamRef.current?.getTracks().forEach(t => t.stop());
  }, []);

  useEffect(() => {
    if (currentMode === 'recording' && timeRemaining === 0) {
      stopRecording();
    }
  }, [timeRemaining, currentMode, stopRecording]);

  // Discards the take: what's on the canvas no longer matches it.
  const returnToEdit = useCallback(async () => {
    setRecordedBlob(null);
    setRecordedAudioBlob(null);
    onRecordingChange(false);
    setTimeRemaining(timeLimitSeconds);
    setCurrentMode('edit');
    await startStream();
  }, [
    setRecordedBlob,
    setRecordedAudioBlob,
    onRecordingChange,
    timeLimitSeconds,
    startStream,
  ]);

  const startRecording = useCallback(() => {
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
      // Order matters: 'preview' must land after the caller can see a take
      // exists, or 'preview' + a caller still asking 'edit' reads as discard.
      setRecordedBlob(blob);
      onRecordingChange(true);
      onIsRecordingChange?.(false);
      setCurrentMode('preview');
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
    setCurrentMode('recording');

    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
  }, [
    timeLimitSeconds,
    setRecordedBlob,
    setRecordedAudioBlob,
    onRecordingChange,
    onIsRecordingChange,
  ]);

  // 'edit', not !== 'recording': avoids reacting to the countdown's own stop.
  useEffect(() => {
    if (disabled) return;
    if (mode === 'recording' && currentMode === 'edit') {
      startRecording();
    } else if (mode !== 'recording' && currentMode === 'recording') {
      stopRecording();
    } else if (mode === 'edit' && currentMode === 'preview') {
      returnToEdit();
    }
  }, [
    mode,
    currentMode,
    disabled,
    startRecording,
    stopRecording,
    returnToEdit,
  ]);

  if (error) {
    return <p className={styles.error}>{error}</p>;
  }

  if (currentMode === 'preview' && previewUrl) {
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
      {currentMode === 'edit' && <EditToolbar />}
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
        {currentMode === 'recording' && (
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
