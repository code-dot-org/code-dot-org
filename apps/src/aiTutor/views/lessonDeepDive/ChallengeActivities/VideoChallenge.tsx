import {VideoRecorder} from '@code-dot-org/lesson-deep-dive';
import {AiChatClientTypes} from '@code-dot-org/shared-constants';
import React, {FC, useCallback, useEffect, useRef, useState} from 'react';

import AichatContextManager from '@cdo/apps/aichat/aichatContextManager';
import {getClientApi} from '@cdo/apps/aichat/api/client';
import WaitingAnimation from '@cdo/apps/aichat/views/WaitingAnimation';
import HttpClient from '@cdo/apps/util/HttpClient';

import {
  Challenge,
  ChallengeResponse,
  challengeResponseValidator,
} from '../types';

import {requestEvaluation} from './requestEvaluation';

// import freeResponseStyles from './free-response.module.scss';
import styles from './video-challenge.module.scss';

interface VideoChallengeProps {
  submitted: boolean;
  submitCallback: React.Dispatch<React.SetStateAction<boolean>>;
  challenge: Challenge | null;
  lessonId: number;
}

const VideoChallenge: FC<VideoChallengeProps> = ({
  submitted,
  submitCallback,
  lessonId,
  challenge = null,
}) => {
  const [hasRecording, setHasRecording] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const [isUploading, setIsUploading] = useState(false);
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
      requestEvaluation(challengeResponse.id);

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

  return (
    <div>
      <div className={styles.questionText}>
        {challenge ? challenge.question : 'DUMMY PROBLEM TEXT HERE'}
      </div>
      <VideoRecorder
        onRecordingChange={setHasRecording}
        onIsRecordingChange={setIsRecording}
        disabled={submitted || isUploading}
        recordedUrl={recordedUrl}
        setRecordedUrl={setRecordedUrl}
        recordedAudioUrl={recordedAudioUrl}
        setRecordedAudioUrl={setRecordedAudioUrl}
      />
      {isUploading && <WaitingAnimation shouldDisplay={isUploading} />}
      {!submitted && (
        <button
          type="button"
          className={styles.submitButton}
          disabled={!canSubmit}
          onClick={handleSubmit}
        >
          Submit
        </button>
      )}
    </div>
  );
};

export default VideoChallenge;
