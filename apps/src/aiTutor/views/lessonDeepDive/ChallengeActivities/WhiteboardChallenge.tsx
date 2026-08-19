import {
  useTheme,
  ThemeProvider,
} from '@code-dot-org/component-library/common/contexts';
import {AiChatClientTypes} from '@code-dot-org/shared-constants';
import {createTheme, ThemeProvider as MuiThemeProvider} from '@mui/material';
import {ReactFlowProvider, useReactFlow} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import React, {FC, useEffect, useRef, useState} from 'react';

import AichatContextManager from '@cdo/apps/aichat/aichatContextManager';
import {getClientApi} from '@cdo/apps/aichat/api/client';
import ReactFlowCanvas from '@cdo/apps/sketchlab/reactFlow/components/ReactFlowCanvas';
import {ReactFlowSketchLabSources} from '@cdo/apps/sketchlab/reactFlow/types';
import {createSketchSnapshotBlob} from '@cdo/apps/sketchlab/reactFlow/utils/createSketchSnapshotBlob';
import HttpClient from '@cdo/apps/util/HttpClient';

import {ExplanationTypes} from '../types';

import AudioRecorder from './AudioRecorder';
import {requestEvaluation} from './requestEvaluation';

import videoChallengeStyles from './video-challenge.module.scss';
import styles from './whiteboard-challenge.module.scss';

const DEFAULT_SOURCES: ReactFlowSketchLabSources = {
  source: {nodes: [], edges: []},
};

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
  submitted: boolean;
  submitCallback: React.Dispatch<React.SetStateAction<boolean>>;
  isRecording: boolean;
  setIsRecording: React.Dispatch<React.SetStateAction<boolean>>;
  hasRecording: boolean;
  setHasRecording: React.Dispatch<React.SetStateAction<boolean>>;
  explanationType: string | null;
  lessonId: number;
  textExplanation: string;
}

// Split from the default export so useReactFlow (needed by the snapshot
// capture on submit) runs inside the ReactFlowProvider.
const WhiteboardChallengeContent: FC<WhiteboardChallengeProps> = ({
  challengeId,
  submitted,
  submitCallback,
  isRecording,
  setIsRecording,
  hasRecording,
  setHasRecording,
  explanationType,
  lessonId,
  textExplanation,
}) => {
  // ReactFlowCanvas reports edits through the same updateSources contract
  // as sketchlab's SourcesContainer; here the drawing lives in local state
  // until it is captured as an image on submit.
  const [sources, setSources] =
    useState<ReactFlowSketchLabSources>(DEFAULT_SOURCES);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const reactFlow = useReactFlow();

  const canSubmit =
    !submitted &&
    !submitting &&
    challengeId !== null &&
    sources.source.nodes.length > 0;

  const clientType = AiChatClientTypes.LESSON_DEEP_DIVE;

  useEffect(() => {
    AichatContextManager.setContext({
      clientType,
      currentLevelId: null,
      scriptId: null,
      channelId: undefined,
      lessonId,
    });
  }, [clientType, lessonId]);

  const transcribeAudio = async (timedOut = false) => {
    if (!recordedUrl) return null;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    try {
      const audio = await fetch(recordedUrl).then(r => r.blob());

      const aichatClientApi = await getClientApi();
      const text = await aichatClientApi.transcribeAudio(audio);
      return text;
      // setTranscribedText(text);
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  // Snapshot the canvas as a PNG, create the challenge response, and PUT
  // the image bytes to the asset upload endpoint (which stores them in S3
  // server-side; the bucket has no CORS rules for direct browser PUTs).
  const handleSubmit = async () => {
    if (challengeId === null) {
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const {blob, error} = await createSketchSnapshotBlob(reactFlow);
      if (error || !blob) {
        throw new Error(error ?? 'Could not capture your drawing.');
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
        true, // useAuthenticityToken
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
        true, // useAuthenticityToken
        {'Content-Type': 'image/png'}
      );

      // Fire-and-forget: the evaluation result goes to the teacher, not the
      // student, so the submission flow does not wait on it.
      requestEvaluation(created.id);

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

  return (
    <div>
      <div className={styles.whiteboardPane}>
        <ReactFlowCanvas
          updateSources={setSources}
          initialNodes={[]}
          initialEdges={[]}
          initialViewport={undefined}
          colorMode="dark"
          readOnly={submitted}
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
      <button
        type="button"
        className={videoChallengeStyles.submitButton}
        disabled={!canSubmit}
        onClick={handleSubmit}
      >
        {submitting ? 'Submitting…' : 'Submit'}
      </button>
    </div>
  );
};

const WhiteboardChallenge: FC<WhiteboardChallengeProps> = props => (
  <MuiThemeProvider theme={darkTheme}>
    <ThemeProvider>
      <ForceDarkTheme />
      <ReactFlowProvider>
        <WhiteboardChallengeContent {...props} />
      </ReactFlowProvider>
    </ThemeProvider>
  </MuiThemeProvider>
);

export default WhiteboardChallenge;
