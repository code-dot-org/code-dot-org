import React, {FC, useCallback, useState} from 'react';

import WaitingAnimation from '@cdo/apps/aichat/views/WaitingAnimation';
import HttpClient from '@cdo/apps/util/HttpClient';

import {
  Challenge,
  ChallengeResponse,
  challengeResponseValidator,
} from '../types';

import VideoRecorder from './VideoRecorder';

// import freeResponseStyles from './free-response.module.scss';
import styles from './video-challenge.module.scss';

interface VideoChallengeProps {
  submitted: boolean;
  submitCallback: React.Dispatch<React.SetStateAction<boolean>>;
  challenge: Challenge | null;
}

const VideoChallenge: FC<VideoChallengeProps> = ({
  submitted,
  submitCallback,
  challenge = null,
}) => {
  const [hasRecording, setHasRecording] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const canSubmit = !submitted && !isUploading && hasRecording && !isRecording;

  const createChallengeResponse = useCallback(() => {
    if (!challenge) {
      return;
    }
    const body = JSON.stringify({
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
  }, [challenge]);

  const handleSubmit = async () => {
    if (!recordedUrl) return;
    setIsUploading(true);
    try {
      const challengeResponse = await createChallengeResponse();
      const assetId = challengeResponse?.assets[0]?.id;
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
    } catch (error) {
      console.log(error);
    } finally {
      submitCallback(true);
      setIsUploading(false);
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
      />
      {isUploading && <WaitingAnimation shouldDisplay={isUploading} />}
      {submitted && !isUploading && (
        <div className={styles.questionText}>Submitted!</div>
      )}
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
