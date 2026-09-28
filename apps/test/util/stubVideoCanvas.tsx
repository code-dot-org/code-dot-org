// Stand-in for VideoCanvas, which needs MediaRecorder, getUserMedia and a
// canvas, none available in jsdom. Like the real recorder, a stop delivers
// its blob a tick later, and only then enters 'preview'.

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
  // Stands in for MediaRecorder.state, which ignores repeated stops
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
        // 'preview' last, as in the real onstop
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

  // Rendered as text so tests can assert on it
  return <div>{`canvas mode: ${currentMode}`}</div>;
};

export default StubVideoCanvas;
