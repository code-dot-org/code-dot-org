import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import React, {FC, useCallback, useEffect, useRef, useState} from 'react';

import styles from './creative-activity.module.scss';

// Proof of concept: students record or upload a short "news anchor" video. The
// video lives only in the browser for the session — nothing is uploaded or
// persisted.

type View = 'choose' | 'recording' | 'review';

// Honor the "less than 2 minutes" brief by capping a recording at 120s.
const MAX_RECORDING_SECONDS = 120;

const formatTime = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const CreativeActivity: FC = () => {
  const [view, setView] = useState<View>('choose');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  // Placeholder only — AI feedback on the video is not wired up yet.
  const [feedbackRequested, setFeedbackRequested] = useState(false);

  const liveVideoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  // Tracks the active object URL so it can be revoked when replaced or unmounted.
  const videoUrlRef = useRef<string | null>(null);

  const setReviewVideo = useCallback((url: string) => {
    if (videoUrlRef.current) {
      URL.revokeObjectURL(videoUrlRef.current);
    }
    videoUrlRef.current = url;
    setVideoUrl(url);
  }, []);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
  }, []);

  const stopRecording = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
    }
  }, []);

  const startRecording = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      streamRef.current = stream;
      setView('recording');
    } catch {
      setError(
        "We couldn't access your camera and microphone. Check your browser permissions and try again."
      );
    }
  }, []);

  // Once the live <video> is on screen, wire it to the camera stream and start
  // the recorder. Runs when we enter the recording view.
  useEffect(() => {
    if (view !== 'recording' || !streamRef.current || !liveVideoRef.current) {
      return;
    }
    const stream = streamRef.current;
    liveVideoRef.current.srcObject = stream;

    chunksRef.current = [];
    const recorder = new MediaRecorder(stream);
    recorderRef.current = recorder;
    recorder.ondataavailable = event => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, {type: recorder.mimeType});
      setReviewVideo(URL.createObjectURL(blob));
      stopStream();
      setView('review');
    };
    recorder.start();

    setElapsed(0);
    const interval = setInterval(() => {
      setElapsed(prev => {
        const next = prev + 1;
        if (next >= MAX_RECORDING_SECONDS) {
          stopRecording();
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [view, setReviewVideo, stopStream, stopRecording]);

  // Clean up the camera and any object URL when the activity unmounts.
  useEffect(
    () => () => {
      stopStream();
      if (videoUrlRef.current) {
        URL.revokeObjectURL(videoUrlRef.current);
      }
    },
    [stopStream]
  );

  const handleUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        setError(null);
        setReviewVideo(URL.createObjectURL(file));
        setView('review');
      }
      // Reset so the same file can be chosen again later.
      event.target.value = '';
    },
    [setReviewVideo]
  );

  const handleStartOver = useCallback(() => {
    setView('choose');
    setFeedbackRequested(false);
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.brief}>
        <h2 className={styles.briefHeading}>Worst Case Scenario</h2>
        <p className={styles.briefBody}>
          Make a video less than 2 minutes where you are a news anchor
          announcing what happened in a high-stakes job (surgeon, pilot,
          engineer, etc) because someone relied on an AI hallucination.
        </p>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {view === 'choose' && (
        <div className={styles.options}>
          <button
            type="button"
            className={styles.optionButton}
            onClick={() => fileInputRef.current?.click()}
          >
            <FontAwesomeV6Icon iconName="upload" />
            Upload a video
          </button>
          <button
            type="button"
            className={styles.optionButton}
            onClick={startRecording}
          >
            <FontAwesomeV6Icon iconName="video" />
            Start recording
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            className={styles.hiddenInput}
            onChange={handleUpload}
          />
        </div>
      )}

      {view === 'recording' && (
        <div className={styles.stage}>
          <div className={styles.recordingBar}>
            <span className={styles.recordingDot} aria-hidden="true" />
            <span className={styles.recordingTime}>
              {formatTime(elapsed)} / {formatTime(MAX_RECORDING_SECONDS)}
            </span>
          </div>
          <video
            ref={liveVideoRef}
            className={styles.video}
            autoPlay
            playsInline
            muted
          />
          <div className={styles.controls}>
            <button
              type="button"
              className={styles.stopButton}
              onClick={stopRecording}
            >
              <FontAwesomeV6Icon iconName="stop" />
              Stop recording
            </button>
          </div>
        </div>
      )}

      {view === 'review' && videoUrl && (
        <div className={styles.stage}>
          <video className={styles.video} src={videoUrl} controls playsInline />
          <div className={styles.controls}>
            <button
              type="button"
              className={styles.feedbackButton}
              onClick={() => setFeedbackRequested(true)}
            >
              <FontAwesomeV6Icon iconName="wand-magic-sparkles" />
              Get AI feedback
            </button>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={handleStartOver}
            >
              <FontAwesomeV6Icon iconName="arrow-rotate-left" />
              Start over
            </button>
          </div>
          {feedbackRequested && (
            <p className={styles.feedbackPlaceholder}>
              AI feedback on your video is coming soon.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default CreativeActivity;
