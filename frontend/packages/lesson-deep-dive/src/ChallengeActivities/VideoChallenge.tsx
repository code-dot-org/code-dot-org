import {
  type Dispatch,
  type FC,
  type MutableRefObject,
  type SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react';

import {useApiClient} from '@code-dot-org/core/api';

import {createChallengeResponse, uploadChallengeResponseAsset} from '../api';
import {type Challenge, type StickerSection} from '../types';

import {requestEvaluation} from './requestEvaluation';
import VideoCanvas, {type VideoCanvasMode} from './VideoCanvas';

import styles from './video-challenge.module.scss';

interface VideoChallengeProps {
  submitted: boolean;
  submitCallback: Dispatch<SetStateAction<boolean>>;
  isRecording: boolean;
  setIsRecording: Dispatch<SetStateAction<boolean>>;
  hasRecording: boolean;
  setHasRecording: Dispatch<SetStateAction<boolean>>;
  challenge: Challenge | null;
  setEvaluationStatus: Dispatch<SetStateAction<string>>;
  setChallengeResponseId: Dispatch<SetStateAction<number>>;
  onSubmittableChange: (canSubmit: boolean) => void;
  submitRef: MutableRefObject<(() => Promise<number | null>) | null>;
  resetRef: MutableRefObject<(() => void) | null>;
  transcribeAudio: (audio: Blob) => Promise<string>;
  stickerSections: StickerSection[];
}

const VideoChallenge: FC<VideoChallengeProps> = ({
  submitted,
  submitCallback,
  isRecording,
  setIsRecording,
  hasRecording,
  setHasRecording,
  challenge = null,
  setEvaluationStatus,
  setChallengeResponseId,
  onSubmittableChange,
  submitRef,
  resetRef,
  transcribeAudio,
  stickerSections,
}) => {
  const api = useApiClient();
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const [isUploading, setIsUploading] = useState(false);
  // Bumped to remount the recorder with a clean slate on "Start over".
  const [resetKey, setResetKey] = useState(0);
  const canSubmit = !submitted && !isUploading && hasRecording && !isRecording;
  const mode: VideoCanvasMode = isRecording
    ? 'recording'
    : hasRecording
      ? 'preview'
      : 'edit';

  const handleSubmit = async (): Promise<number | null> => {
    if (!recordedBlob || !challenge) return null;
    setIsUploading(true);
    try {
      const text = await transcribeRecording();
      const challengeResponse = await createChallengeResponse(api.transport, {
        transcript: text,
        challenge_id: challenge.id,
        is_final: true,
        assets: [{asset_type: 'video'}],
      });
      const assetId = challengeResponse.assets[0]?.id;
      if (!assetId) {
        throw new Error('The server did not return a video asset.');
      }
      await uploadChallengeResponseAsset(
        api.transport,
        assetId,
        recordedBlob,
        'video/webm',
      );

      // Fire-and-forget: the evaluation result goes to the teacher, not the
      // student, so the submission flow does not wait on it.
      const status = await requestEvaluation(
        api.transport,
        challengeResponse.id,
      );
      setEvaluationStatus(status);
      setChallengeResponseId(challengeResponse.id);

      // Only confirm once the upload actually succeeded; the confirmation
      // dialog in ChallengeBox keys off this.
      submitCallback(true);
      return challengeResponse.attempt_number;
    } catch (error) {
      console.log(error);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const transcribeRecording = async () => {
    if (!recordedAudioBlob) return null;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    try {
      return await transcribeAudio(recordedAudioBlob);
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  // Discard the recording (by remounting the recorder) so the student can
  // record again from scratch.
  const handleReset = () => {
    setRecordedBlob(null);
    setRecordedAudioBlob(null);
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
      <VideoCanvas
        key={resetKey}
        mode={mode}
        onRecordingChange={setHasRecording}
        onIsRecordingChange={setIsRecording}
        disabled={submitted || isUploading}
        recordedBlob={recordedBlob}
        setRecordedBlob={setRecordedBlob}
        recordedAudioBlob={recordedAudioBlob}
        setRecordedAudioBlob={setRecordedAudioBlob}
        timeLimitSeconds={60}
        stickerSections={stickerSections}
      />
    </div>
  );
};

export default VideoChallenge;
