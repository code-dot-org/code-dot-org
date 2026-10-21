// Chooses which screen to show: the checkpoint map, one checkpoint's steps,
// or the project on its own. Owns the progress they share.

import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {setAiGatewayOptIn} from '@cdo/apps/aichat/api/shouldUseAiGateway';
import {AichatContext} from '@cdo/apps/aichat/types';
import {
  sendAdaptiveStepReport,
  sendStartedReportIfNotStarted,
} from '@cdo/apps/code-studio/progressRedux';
import Loading from '@cdo/apps/lab2/views/Loading';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import {AiChatClientTypes} from '@cdo/generated-scripts/sharedConstants';

import {isAdaptiveAiEnabled} from '../ai/generate';
import {
  PROJECT_STEP_ID,
  Progress,
  stepIdToResume,
  useProgress,
} from '../progress';
import {ProgressKey} from '../progress/progressStore';
import {Checkpoint, Pathway} from '../types';

import {checkpointStepFromUrl, clearUrl} from './checkpointUrl';
import MapScreen from './MapScreen';
import {PathwayContext} from './PathwayContext';
import StepPlayer from './steps/StepPlayer';

import styles from './shared.module.scss';

type View =
  | {kind: 'map'; focusId?: string}
  | {kind: 'step'; checkpointId: string; stepId?: string}
  | {kind: 'project'};

interface PathwayAppProps {
  pathway: Pathway;
  progressKey: ProgressKey;
}

/**
 * The project as a one-step checkpoint, so the player can open it. The
 * template level is playable and its channel is the project itself; the
 * pathway's project brief stands in for the level's own instructions.
 */
function projectCheckpoint(pathway: Pathway): Checkpoint {
  return {
    id: 'project',
    title: 'My Project',
    description: pathway.project.description,
    steps: [
      {
        id: PROJECT_STEP_ID,
        title: 'Work on my Project',
        kind: 'level',
        level: pathway.project.templateLevel,
        project: true,
        instructions: pathway.project.description,
        levelProperties: pathway.project.levelProperties,
      },
    ],
  };
}

const PathwayApp: React.FunctionComponent<PathwayAppProps> = ({
  pathway,
  progressKey,
}) => {
  const dispatch = useAppDispatch();
  const reportLevelStep = useCallback(
    (levelId: number, appType: string, result: number, timeMs: number) =>
      dispatch(sendAdaptiveStepReport(levelId, appType, result, timeMs)),
    [dispatch]
  );
  const {progress, statusMap, ...actions} = useProgress(pathway, progressKey, {
    reportLevelStep,
  });
  if (!progress) {
    return (
      <div className={styles.app}>
        <Loading isLoading />
      </div>
    );
  }
  const {checkpointId: urlCheckpointId, stepId: urlStepId} =
    checkpointStepFromUrl();

  let initialCheckpointId: string | undefined;
  let initialStepId: string | undefined;

  if (urlCheckpointId) {
    // URL names a checkpoint: open it, and use the URL step if it belongs there.
    initialCheckpointId = urlCheckpointId;
    const cp = pathway.checkpoints.find(c => c.id === urlCheckpointId);
    if (cp) {
      const urlStepValid = cp.steps.some(s => s.id === urlStepId);
      initialStepId = urlStepValid ? urlStepId : stepIdToResume(cp, progress);
    }
  } else {
    // No URL checkpoint: auto-start only when the student hasn't begun yet.
    // A step with generatedInstructions but no status doesn't count as started.
    const hasProgress = Object.values(progress.steps).some(s => s.status);
    if (!hasProgress) {
      const firstCp = pathway.checkpoints[0];
      if (firstCp) {
        initialCheckpointId = firstCp.id;
        initialStepId = stepIdToResume(firstCp, progress);
      }
    }
  }

  return (
    <LoadedPathwayApp
      pathway={pathway}
      progressKey={progressKey}
      progress={progress}
      statusMap={statusMap}
      initialCheckpointId={initialCheckpointId}
      initialStepId={initialStepId}
      {...actions}
    />
  );
};

/** What useProgress returns once the stored progress has loaded. */
type LoadedProgress = ReturnType<typeof useProgress> & {progress: Progress};

type LoadedPathwayAppProps = PathwayAppProps &
  LoadedProgress & {
    /** Checkpoint to open on mount; absent → show map. */
    initialCheckpointId?: string;
    /** Step within initialCheckpointId to start on. */
    initialStepId?: string;
  };

// The pathway once its progress is known. Reads initialCheckpointId and
// initialStepId once, on mount.
const LoadedPathwayApp: React.FunctionComponent<LoadedPathwayAppProps> = ({
  pathway,
  progressKey,
  progress,
  statusMap,
  initialCheckpointId,
  initialStepId,
  startStep,
  completeStep,
  leaveStep,
  saveGeneratedInstructions,
  finishCheckpoint,
  saveAnswers,
}) => {
  const dispatch = useAppDispatch();
  const [view, setView] = useState<View>(
    initialCheckpointId
      ? {kind: 'step', checkpointId: initialCheckpointId, stepId: initialStepId}
      : {kind: 'map'}
  );

  // Handle browser back/forward at the checkpoint level.
  useEffect(() => {
    const handler = () => {
      const {checkpointId, stepId: urlStep} = checkpointStepFromUrl();
      if (!checkpointId) {
        setView({kind: 'map'});
      } else if (checkpointId === 'project') {
        setView({kind: 'project'});
      } else {
        const cp = pathway.checkpoints.find(c => c.id === checkpointId);
        const validUrlStep = cp?.steps.some(s => s.id === urlStep)
          ? urlStep
          : undefined;
        setView({
          kind: 'step',
          checkpointId,
          stepId:
            validUrlStep ?? (cp ? stepIdToResume(cp, progress) : undefined),
        });
      }
    };
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, [pathway.checkpoints, progress]);

  // The verdict is only logged for now; nothing acts on it yet.
  const {lastRouting} = progress;
  useEffect(() => {
    if (lastRouting) console.log('[adaptive router]', lastRouting);
  }, [lastRouting]);
  useEffect(() => {
    if (initialCheckpointId)
      dispatch(sendStartedReportIfNotStarted('adaptive'));
  }, [initialCheckpointId, dispatch]);
  const project = useMemo(() => projectCheckpoint(pathway), [pathway]);
  // Use AI Gateway for AI Tutor in Weblab2 steps, if adaptive AI is enabled.
  useEffect(() => {
    setAiGatewayOptIn(isAdaptiveAiEnabled());
    return () => setAiGatewayOptIn(false);
  }, []);

  const checkpoint =
    view.kind === 'step'
      ? pathway.checkpoints.find(c => c.id === view.checkpointId)
      : undefined;
  const playing = view.kind === 'project' ? project : checkpoint;
  // The shell's AI calls run as the adaptive level, not the step's level.
  const aiContext = useMemo<AichatContext>(
    () => ({
      clientType: AiChatClientTypes.ADAPTIVE,
      currentLevelId: progressKey.levelId,
      scriptId: progressKey.scriptId,
      channelId: undefined,
    }),
    [progressKey.levelId, progressKey.scriptId]
  );
  const pathwayContext = useMemo(
    () =>
      playing && {
        pathway,
        checkpoint: playing,
        statusMap,
        progress,
        saveGeneratedInstructions,
        aiContext,
      },
    [
      pathway,
      playing,
      statusMap,
      progress,
      saveGeneratedInstructions,
      aiContext,
    ]
  );

  if (pathwayContext) {
    const isProject = view.kind === 'project';
    const {checkpoint} = pathwayContext;
    return (
      <div className={styles.app}>
        <PathwayContext.Provider value={pathwayContext}>
          <StepPlayer
            checkpoint={checkpoint}
            finishLabel={isProject ? 'Back to map' : undefined}
            initialStepId={view.kind === 'step' ? view.stepId : undefined}
            onStartStep={startStep}
            onCompleteStep={completeStep}
            onLeaveStep={leaveStep}
            onSaveAnswers={saveAnswers}
            onExit={() => {
              clearUrl();
              setView({
                kind: 'map',
                focusId: isProject ? undefined : checkpoint.id,
              });
            }}
            onFinish={() => {
              clearUrl();
              if (!isProject) finishCheckpoint(checkpoint);
              setView({kind: 'map'});
            }}
          />
        </PathwayContext.Provider>
      </div>
    );
  }

  return (
    <div className={styles.app}>
      <MapScreen
        pathway={pathway}
        statusMap={statusMap}
        focusId={view.kind === 'map' ? view.focusId : undefined}
        onFocus={focusId => setView({kind: 'map', focusId})}
        onStart={id => {
          dispatch(sendStartedReportIfNotStarted('adaptive'));
          const cp = pathway.checkpoints.find(c => c.id === id);
          setView({
            kind: 'step',
            checkpointId: id,
            stepId: cp ? stepIdToResume(cp, progress) : undefined,
          });
        }}
        onWorkOnProject={() => {
          dispatch(sendStartedReportIfNotStarted('adaptive'));
          setView({kind: 'project'});
        }}
      />
    </div>
  );
};

export default PathwayApp;
