import {Button} from '@code-dot-org/component-library/button';
import React, {useRef, useState} from 'react';

import {AITranscriber} from '@cdo/apps/aichat/api/client';

import styles from './styles.module.scss';

interface TranscribeButtonProps {
  onTranscribed: (text: string) => void;
  onRecordStart?: () => void;
  onRecordEnd?: () => void;
}

const TranscribeButton: React.FC<TranscribeButtonProps> = ({
  onTranscribed,
  onRecordStart,
  onRecordEnd,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const transcriberRef = useRef<AITranscriber>(new AITranscriber());

  const onStartRecording = async () => {
    try {
      await transcriberRef.current.start();
      setIsRecording(true);
      onRecordStart?.();
    } catch (error) {
      console.error("couldn't record. TODO show UI", error);
      // Demo
      setIsRecording(true);
      onRecordStart?.();
    }
  };

  const onCancelRecording = () => {
    transcriberRef.current.cancel();
    setIsRecording(false);
    onRecordEnd?.();
  };

  const onEndRecording = async () => {
    try {
      setIsTranscribing(true);
      const text = await transcriberRef.current.endAndTranscribe();
      setIsTranscribing(false);
      onTranscribed(text);
    } catch (error) {
      console.error("couldn't transcribe. TODO show UI", error);
      // Demo
      setIsTranscribing(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsTranscribing(false);
      onTranscribed('demo text');
    }
    setIsRecording(false);
    onRecordEnd?.();
  };

  if (isRecording) {
    return (
      <div className={styles.buttonRow}>
        {!isTranscribing && 'Recording...'}
        <Button
          isIconOnly
          icon={{
            iconName: isTranscribing ? 'spinner' : 'check',
            animationType: isTranscribing ? 'spin' : undefined,
          }}
          size="xs"
          onClick={onEndRecording}
          color="black"
          type="secondary"
          disabled={isTranscribing}
        />
        {!isTranscribing && (
          <Button
            isIconOnly
            icon={{iconName: 'trash'}}
            size="xs"
            onClick={onCancelRecording}
            color="black"
            type="secondary"
          />
        )}
      </div>
    );
  }

  return (
    <Button
      isIconOnly
      icon={{iconName: 'microphone'}}
      size="xs"
      onClick={onStartRecording}
      disabled={isTranscribing}
      color="black"
      type="secondary"
    />
  );
};

export default TranscribeButton;
