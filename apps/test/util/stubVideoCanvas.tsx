// Stand-in for aiTutor's VideoCanvas, which needs MediaRecorder, getUserMedia
// and a Konva canvas — none available under jsdom.
//
// Mirrors the real component's two states (`mode`, requested by the caller;
// `currentMode`, what the recorder is doing) and their timing: a stop reaches
// 'preview' only once the blob arrives, a tick later. In between, `mode`
// already reads 'edit' (the caller's isRecording flipped, hasRecording
// hasn't yet) while `currentMode` still shows 'recording'.
//
//   jest.mock(
//     '@cdo/apps/aiTutor/views/lessonDeepDive/ChallengeActivities/VideoCanvas',
//     () => jest.requireActual('<path>/stubVideoCanvas')
//   );

import React, {FC, useEffect, useRef, useState} from 'react';

export const recordedVideoBlob = new Blob(['video-bytes'], {
  type: 'video/webm',
});
export const recordedAudioBlob = new Blob(['audio-bytes'], {
  type: 'audio/webm',
});

interface StubVideoCanvasProps {
  mode: 'edit' | 'recording' | 'preview';
  onRecordingChange: (hasRecording: boolean) => void;
  setRecordedBlob: (blob: Blob | null) => void;
  setRecordedAudioBlob: (blob: Blob | null) => void;
  disabled?: boolean;
}

const StubVideoCanvas: FC<StubVideoCanvasProps> = ({
  mode,
  onRecordingChange,
  setRecordedBlob,
  setRecordedAudioBlob,
  disabled = false,
}) => {
  const [currentMode, setCurrentMode] = useState('edit');
  // Stands in for MediaRecorder.state, which the real component reads to
  // settle the repeated stop requests the window above invites.
  const stopping = useRef(false);

  useEffect(() => {
    if (disabled) return;
    if (mode === 'recording' && currentMode === 'edit') {
      setCurrentMode('recording');
    } else if (
      mode !== 'recording' &&
      currentMode === 'recording' &&
      !stopping.current
    ) {
      stopping.current = true;
      Promise.resolve().then(() => {
        stopping.current = false;
        // 'preview' last, matching the real onstop's ordering.
        setRecordedBlob(recordedVideoBlob);
        setRecordedAudioBlob(recordedAudioBlob);
        onRecordingChange(true);
        setCurrentMode('preview');
      });
    } else if (mode === 'edit' && currentMode === 'preview') {
      setCurrentMode('edit');
      setRecordedBlob(null);
      setRecordedAudioBlob(null);
      onRecordingChange(false);
    }
  }, [
    mode,
    currentMode,
    disabled,
    onRecordingChange,
    setRecordedBlob,
    setRecordedAudioBlob,
  ]);

  // Rendered as text so tests can see which surface the canvas is showing:
  // the live stage, or the recorded take playing back.
  return <div>{`canvas mode: ${currentMode}`}</div>;
};

export default StubVideoCanvas;
