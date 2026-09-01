import {VideoRecorder} from '@code-dot-org/lesson-deep-dive';
import React, {FC, useCallback, useEffect, useRef, useState} from 'react';

import AichatContextManager from '@cdo/apps/aichat/aichatContextManager';
import {getClientApi} from '@cdo/apps/aichat/api/client';
import WaitingAnimation from '@cdo/apps/aichat/views/WaitingAnimation';
import HttpClient from '@cdo/apps/util/HttpClient';
import {AiChatClientTypes} from '@cdo/generated-scripts/sharedConstants';

import {
  Challenge,
  ChallengeResponse,
  challengeResponseValidator,
} from '../types';

import {requestEvaluation} from './requestEvaluation';

import styles from './video-challenge.module.scss';

interface VideoChallengeProps {
  submitted: boolean;
  submitCallback: React.Dispatch<React.SetStateAction<boolean>>;
  // Owned by ChallengeBox, which drives the "Start Recording" / "Stop
  // Recording" button in the bottom bar (the same button used to record a
  // whiteboard challenge's audio explanation).
  isRecording: boolean;
  setIsRecording: React.Dispatch<React.SetStateAction<boolean>>;
  hasRecording: boolean;
  setHasRecording: React.Dispatch<React.SetStateAction<boolean>>;
  challenge: Challenge | null;
  lessonId: number;
  setEvaluationStatus: React.Dispatch<React.SetStateAction<string>>;
  setChallengeResponseId: React.Dispatch<React.SetStateAction<number>>;
  // Reports whether the current recording can be submitted, and hands the
  // top-bar "Submit for feedback" / "Start over" buttons this modality's
  // submit and reset handlers.
  onSubmittableChange: (canSubmit: boolean) => void;
  submitRef: React.MutableRefObject<(() => void | Promise<void>) | null>;
  resetRef: React.MutableRefObject<(() => void) | null>;
}

const VideoChallenge: FC<VideoChallengeProps> = ({
  submitted,
  submitCallback,
  isRecording,
  setIsRecording,
  hasRecording,
  setHasRecording,
  lessonId,
  challenge = null,
  setEvaluationStatus,
  setChallengeResponseId,
  onSubmittableChange,
  submitRef,
  resetRef,
}) => {
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const [isUploading, setIsUploading] = useState(false);
  // Bumped to remount the recorder with a clean slate on "Start over".
  const [resetKey, setResetKey] = useState(0);
  const canSubmit = !submitted && !isUploading && hasRecording && !isRecording;
  const clientType = AiChatClientTypes.LESSON_DEEP_DIVE;

  // Initialize the ChatEventLogger with the current context, whenever it updates.
  useEffect(() => {
    AichatContextManager.setContext({
      clientType,
      currentLevelId: null,
      scriptId: null,
      channelId: undefined,
      lessonId,
    });
  }, [clientType, lessonId]);

  const createChallengeResponse = useCallback(
    (text: string | null) => {
      if (!challenge) {
        return;
      }
      const body = JSON.stringify({
        transcript: text,
        challenge_id: challenge.id,
        is_final: true,
        assets: [{asset_type: 'video'}],
      });
      return HttpClient.post('/challenge_responses', body, true, {
        'Content-Type': 'application/json',
      })
        .then(response => response.json())
        .then((json): ChallengeResponse => challengeResponseValidator(json))
        .catch(error => {
          console.log(error);
          return undefined;
        });
    },
    [challenge]
  );

  const handleSubmit = async () => {
    if (!recordedUrl) return;
    setIsUploading(true);
    try {
      const text = await transcribeAudio();
      const challengeResponse = await createChallengeResponse(text);
      if (!challengeResponse) {
        throw new Error('The server did not create a challenge response.');
      }
      const assetId = challengeResponse.assets[0]?.id;
      if (!assetId) {
        throw new Error('The server did not return a video asset.');
      }
      const blob = await fetch(recordedUrl).then(r => r.blob());
      await HttpClient.put(
        `/challenge_response_assets/${assetId}/upload`,
        blob,
        true, // useAuthenticityToken
        {'Content-Type': 'video/webm'}
      );

      // Fire-and-forget: the evaluation result goes to the teacher, not the
      // student, so the submission flow does not wait on it.
      const status = await requestEvaluation(challengeResponse.id);
      setEvaluationStatus(status);
      setChallengeResponseId(challengeResponse.id);

      // Only confirm once the upload actually succeeded; the confirmation
      // dialog in ChallengeBox keys off this.
      submitCallback(true);
    } catch (error) {
      console.log(error);
    } finally {
      setIsUploading(false);
    }
  };

  const transcribeAudio = async (timedOut = false) => {
    if (!recordedAudioUrl) return null;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    try {
      const audio = await fetch(recordedAudioUrl).then(r => r.blob());

      const aichatClientApi = await getClientApi();
      const text = await aichatClientApi.transcribeAudio(audio);
      return text;
      // setTranscribedText(text);
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  // Discard the recording (by remounting the recorder) so the student can
  // record again from scratch.
  const handleReset = () => {
    setRecordedUrl(null);
    setRecordedAudioUrl(null);
    setHasRecording(false);
    setIsRecording(false);
    setResetKey(key => key + 1);
  };

  // Keep the top bar's "Submit for feedback" enabled state in sync.
  useEffect(() => {
    onSubmittableChange(canSubmit);
  }, [canSubmit, onSubmittableChange]);

  // Register this modality's handlers for the top-bar buttons. Runs every
  // render so the refs hold the latest closures, and clears them on unmount
  // (e.g. switching to the whiteboard modality).
  useEffect(() => {
    submitRef.current = handleSubmit;
    resetRef.current = handleReset;
    return () => {
      submitRef.current = null;
      resetRef.current = null;
    };
  });

  return (
    <div className={styles.videoContainer}>
      <VideoRecorder
        key={resetKey}
        isRecording={isRecording}
        onRecordingChange={setHasRecording}
        onIsRecordingChange={setIsRecording}
        disabled={submitted || isUploading}
        recordedUrl={recordedUrl}
        setRecordedUrl={setRecordedUrl}
        recordedAudioUrl={recordedAudioUrl}
        setRecordedAudioUrl={setRecordedAudioUrl}
      />
      {isUploading && <WaitingAnimation shouldDisplay={isUploading} />}
    </div>
  );
};

export default VideoChallenge;
