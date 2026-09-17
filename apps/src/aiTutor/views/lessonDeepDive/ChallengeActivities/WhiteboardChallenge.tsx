import {
  useTheme,
  ThemeProvider,
} from '@code-dot-org/component-library/common/contexts';
import {createTheme, ThemeProvider as MuiThemeProvider} from '@mui/material';
import React, {FC, useEffect, useRef, useState} from 'react';

import AichatContextManager from '@cdo/apps/aichat/aichatContextManager';
import {getClientApi} from '@cdo/apps/aichat/api/client';
import HttpClient from '@cdo/apps/util/HttpClient';
import {AiChatClientTypes} from '@cdo/generated-scripts/sharedConstants';

import {ExplanationTypes} from '../types';

import AudioRecorder from './AudioRecorder';
import {requestEvaluation} from './requestEvaluation';
import SvgCanvas, {SvgCanvasHandle} from './SvgCanvas';

import styles from './whiteboard-challenge.module.scss';

// The subset of ChallengeResponse#summarize(assets_for_upload: true) we
// consume: the asset id to PUT the whiteboard image bytes to.
interface CreatedChallengeResponse {
  id: number;
  assets: {id: number; asset_type: string}[];
}

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

// The canvas's element toolbars read the component-library ThemeContext,
// which lab2 provides at its app root but the Tutor+ page does not. The
// provider defaults to Light and takes no initial value, so force Dark to
// match the deep dive UI.
const ForceDarkTheme: FC = () => {
  const {theme, setTheme} = useTheme();
  useEffect(() => {
    if (theme !== 'Dark') {
      setTheme('Dark');
    }
  }, [theme, setTheme]);
  return null;
};

interface WhiteboardChallengeProps {
  // Null while ChallengeBox is still fetching the challenge.
  challengeId: number | null;
  // Same-origin path to the challenge's starter image, or null when it has
  // none. When set, the canvas mounts with the image as a locked layer.
  starterImageUrl: string | null;
  starterImageAltText: string | null;
  submitted: boolean;
  submitCallback: React.Dispatch<React.SetStateAction<boolean>>;
  isRecording: boolean;
  setIsRecording: React.Dispatch<React.SetStateAction<boolean>>;
  hasRecording: boolean;
  setHasRecording: React.Dispatch<React.SetStateAction<boolean>>;
  explanationType: string | null;
  lessonId: number;
  textExplanation: string;
  setEvaluationStatus: React.Dispatch<React.SetStateAction<string>>;
  setChallengeResponseId: React.Dispatch<React.SetStateAction<number>>;
  // Reports whether the current drawing can be submitted, and hands the
  // top-bar "Submit for feedback" / "Start over" buttons this modality's
  // submit and reset handlers.
  onSubmittableChange: (canSubmit: boolean) => void;
  submitRef: React.MutableRefObject<(() => void | Promise<void>) | null>;
  resetRef: React.MutableRefObject<(() => void) | null>;
}

const WhiteboardChallenge: FC<WhiteboardChallengeProps> = ({
  challengeId,
  starterImageUrl,
  starterImageAltText,
  submitted,
  submitCallback,
  isRecording,
  setIsRecording,
  hasRecording,
  setHasRecording,
  explanationType,
  lessonId,
  textExplanation,
  setEvaluationStatus,
  setChallengeResponseId,
  onSubmittableChange,
  submitRef,
  resetRef,
}) => {
  const svgCanvasRef = useRef<SvgCanvasHandle>(null);
  const [hasObjects, setHasObjects] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  // Bumped to remount the canvas with an empty drawing on "Start over".
  const [resetKey, setResetKey] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const clientType = AiChatClientTypes.LESSON_DEEP_DIVE;

  const canSubmit =
    !submitted &&
    !submitting &&
    challengeId !== null &&
    hasObjects &&
    ((explanationType === ExplanationTypes.AUDIO && hasRecording) ||
      (explanationType === ExplanationTypes.TEXT && textExplanation !== null));

  useEffect(() => {
    AichatContextManager.setContext({
      clientType,
      currentLevelId: null,
      scriptId: null,
      channelId: undefined,
      lessonId,
    });
  }, [clientType, lessonId]);

  const transcribeAudio = async () => {
    if (!recordedUrl) return null;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    try {
      const audio = await fetch(recordedUrl).then(r => r.blob());
      const aichatClientApi = await getClientApi();
      return await aichatClientApi.transcribeAudio(audio);
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  // Snapshot the canvas as PNG, create the challenge response, and PUT the
  // image bytes to the asset upload endpoint.
  const handleSubmit = async () => {
    if (challengeId === null) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const blob = await svgCanvasRef.current?.getBlob();
      if (!blob) {
        throw new Error('Could not capture your drawing.');
      }

      const transcript =
        explanationType === ExplanationTypes.AUDIO && hasRecording
          ? await transcribeAudio()
          : null;

      const text =
        explanationType === ExplanationTypes.TEXT ? textExplanation : null;

      const response = await HttpClient.post(
        '/challenge_responses',
        JSON.stringify({
          challenge_id: challengeId,
          is_final: true,
          assets: [{asset_type: 'whiteboard_image'}],
          transcript: transcript,
          student_text: text,
        }),
        true,
        {'Content-Type': 'application/json'}
      );
      const created: CreatedChallengeResponse = await response.json();

      const assetId = created.assets.find(
        asset => asset.asset_type === 'whiteboard_image'
      )?.id;
      if (assetId === undefined) {
        throw new Error('The server did not return a whiteboard asset.');
      }
      await HttpClient.put(
        `/challenge_response_assets/${assetId}/upload`,
        blob,
        true,
        {'Content-Type': 'image/png'}
      );

      // Fire-and-forget: the evaluation result goes to the teacher, not the
      // student, so the submission flow does not wait on it.
      const status = await requestEvaluation(created.id);
      setChallengeResponseId(created.id);
      setEvaluationStatus(status);
      submitCallback(true);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'Something went wrong. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Remount the canvas with an empty drawing and clear audio.
  const handleReset = () => {
    setResetKey(key => key + 1);
    setHasObjects(false);
    setSubmitError(null);
    setRecordedUrl(null);
  };

  useEffect(() => {
    onSubmittableChange(canSubmit);
  }, [canSubmit, onSubmittableChange]);

  useEffect(() => {
    submitRef.current = handleSubmit;
    resetRef.current = handleReset;
    return () => {
      submitRef.current = null;
      resetRef.current = null;
    };
  });

  return (
    <div className={styles.whiteboardChallenge}>
      <div className={styles.whiteboardPane}>
        <SvgCanvas
          key={resetKey}
          ref={svgCanvasRef}
          readOnly={submitted}
          starterImageUrl={starterImageUrl}
          starterImageAltText={starterImageAltText}
          onHasObjectsChange={setHasObjects}
        />
        {explanationType === ExplanationTypes.AUDIO && (
          <div className={styles.audioContainer}>
            <AudioRecorder
              isRecording={isRecording}
              onRecordingChange={setHasRecording}
              onIsRecordingChange={setIsRecording}
              recordedUrl={recordedUrl}
              setRecordedUrl={setRecordedUrl}
              disabled={submitted}
            />
          </div>
        )}
      </div>
      {submitError && <p className={styles.submitError}>{submitError}</p>}
    </div>
  );
};

export default function WhiteboardChallengeWithProviders(
  props: WhiteboardChallengeProps
) {
  return (
    <MuiThemeProvider theme={darkTheme}>
      <ThemeProvider>
        <ForceDarkTheme />
        <WhiteboardChallenge {...props} />
      </ThemeProvider>
    </MuiThemeProvider>
  );
}
