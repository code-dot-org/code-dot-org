import {
  useTheme,
  ThemeProvider,
} from '@code-dot-org/component-library/common/contexts';
import {createTheme, ThemeProvider as MuiThemeProvider} from '@mui/material';
import {ReactFlowProvider, useReactFlow} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import React, {FC, useEffect, useRef, useState} from 'react';

import AichatContextManager from '@cdo/apps/aichat/aichatContextManager';
import {getClientApi} from '@cdo/apps/aichat/api/client';
import {SketchlabReactFlowNode} from '@cdo/apps/lab2/types';
import ReactFlowCanvas from '@cdo/apps/sketchlab/reactFlow/components/ReactFlowCanvas';
import {ReactFlowSketchLabSources} from '@cdo/apps/sketchlab/reactFlow/types';
import {createSketchSnapshotBlob} from '@cdo/apps/sketchlab/reactFlow/utils/createSketchSnapshotBlob';
import HttpClient from '@cdo/apps/util/HttpClient';
import {createUuid} from '@cdo/apps/utils';
import {AiChatClientTypes} from '@cdo/generated-scripts/sharedConstants';

import {ExplanationTypes} from '../types';

import AudioRecorder from './AudioRecorder';
import {requestEvaluation} from './requestEvaluation';

import styles from './whiteboard-challenge.module.scss';

const DEFAULT_SOURCES: ReactFlowSketchLabSources = {
  source: {nodes: [], edges: []},
};

// Cap the longer side of the starter image node so a large teacher-provided
// image lands at a workable size; fitView then frames it.
const STARTER_IMAGE_MAX_DIMENSION_PX = 600;

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

function measureImage(src: string): Promise<{width: number; height: number}> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () =>
      resolve({width: image.naturalWidth, height: image.naturalHeight});
    image.onerror = () => reject(new Error('Could not load starter image.'));
    image.src = src;
  });
}

// Loads the starter image and returns a locked image node to seed the canvas
// with, or null if it can't be fetched. The image is inlined as a data URL so
// the submission snapshot (html-to-image) captures it without a cross-origin
// taint; the node is locked so the student draws over the prompt rather than
// moving or deleting it.
async function buildStarterImageNode(
  url: string,
  altText: string | null
): Promise<SketchlabReactFlowNode | null> {
  const response = await fetch(url, {credentials: 'same-origin'});
  if (!response.ok) {
    return null;
  }
  const dataUrl = await blobToDataUrl(await response.blob());
  const {width, height} = await measureImage(dataUrl);
  const scale = Math.min(
    1,
    STARTER_IMAGE_MAX_DIMENSION_PX / Math.max(width, height)
  );
  return {
    id: createUuid(),
    type: 'image',
    position: {x: 0, y: 0},
    width: Math.round(width * scale),
    height: Math.round(height * scale),
    data: {
      src: dataUrl,
      altText: altText ?? 'Starter image',
      locked: true,
    },
  };
}

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
  // none. When set, the canvas mounts with the image as a locked node.
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

// Split from the default export so useReactFlow (needed by the snapshot
// capture on submit) runs inside the ReactFlowProvider.
const WhiteboardChallengeContent: FC<WhiteboardChallengeProps> = ({
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
  // ReactFlowCanvas reports edits through the same updateSources contract
  // as sketchlab's SourcesContainer; here the drawing lives in local state
  // until it is captured as an image on submit.
  const [sources, setSources] =
    useState<ReactFlowSketchLabSources>(DEFAULT_SOURCES);
  // Nodes the canvas mounts with. null means "still resolving the starter
  // image" — the canvas reads initialNodes only at mount, so it must not
  // render until this settles. Resolves synchronously to [] when there is no
  // starter image, so the common case never shows the loading state.
  const [initialNodes, setInitialNodes] = useState<
    SketchlabReactFlowNode[] | null
  >(starterImageUrl ? null : []);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  // Bumped to remount the canvas with an empty drawing on "Start over".
  const [resetKey, setResetKey] = useState(0);
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

  useEffect(() => {
    if (!starterImageUrl) {
      setInitialNodes([]);
      return;
    }
    let cancelled = false;
    setInitialNodes(null);
    buildStarterImageNode(starterImageUrl, starterImageAltText)
      .then(node => {
        if (!cancelled) {
          setInitialNodes(node ? [node] : []);
        }
      })
      .catch(() => {
        // A missing or unreadable starter image just leaves a blank canvas.
        if (!cancelled) {
          setInitialNodes([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [starterImageUrl, starterImageAltText]);

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

  // Clear the drawing (by remounting the canvas) and any pending audio.
  const handleReset = () => {
    setResetKey(key => key + 1);
    setSources(DEFAULT_SOURCES);
    setSubmitError(null);
    setRecordedUrl(null);
  };

  // Keep the top bar's "Submit for feedback" enabled state in sync.
  useEffect(() => {
    onSubmittableChange(canSubmit);
  }, [canSubmit, onSubmittableChange]);

  // Register this modality's handlers for the top-bar buttons. Runs every
  // render so the refs hold the latest closures, and clears them on unmount
  // (e.g. switching to the video modality).
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
        {initialNodes === null ? (
          <div className={styles.starterLoading}>Loading starter image…</div>
        ) : (
          <ReactFlowCanvas
            key={resetKey}
            updateSources={setSources}
            initialNodes={initialNodes}
            initialEdges={[]}
            initialViewport={undefined}
            colorMode="dark"
            readOnly={submitted}
            allowImageUpload={false}
          />
        )}
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
