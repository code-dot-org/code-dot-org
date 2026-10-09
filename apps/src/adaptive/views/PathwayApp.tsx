// Chooses which screen to show: the checkpoint map, one checkpoint's steps,
// or the project on its own. Owns the progress they share.

import React, {useCallback, useMemo, useState} from 'react';

import {AichatContext} from '@cdo/apps/aichat/types';
import {
  sendAdaptiveStepReport,
  sendStartedReportIfNotStarted,
} from '@cdo/apps/code-studio/progressRedux';
import Loading from '@cdo/apps/lab2/views/Loading';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import {AiChatClientTypes} from '@cdo/generated-scripts/sharedConstants';

import {PROJECT_STEP_ID, useProgress} from '../progress';
import {ProgressKey} from '../progress/progressStore';
import {Checkpoint, Pathway} from '../types';

import MapScreen from './MapScreen';
import {PathwayContext} from './PathwayContext';
import StepPlayer from './steps/StepPlayer';

import styles from './shared.module.scss';

type View =
  | {kind: 'map'; focusId?: string}
  | {kind: 'step'; checkpointId: string}
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
    (levelId: number, result: number, timeMs: number) =>
      dispatch(sendAdaptiveStepReport(levelId, result, timeMs)),
    [dispatch]
  );
  const {
    progress,
    statusMap,
    stepContextMap,
    isLoading,
    startStep,
    completeStep,
    leaveStep,
    updateStepContext,
    saveAnswers,
    reset,
  } = useProgress(pathway, progressKey, {reportLevelStep});
  const [view, setView] = useState<View>({kind: 'map'});
  const project = useMemo(() => projectCheckpoint(pathway), [pathway]);

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
      playing &&
      progress && {
        pathway,
        checkpoint: playing,
        statusMap,
        stepContextMap,
        updateStepContext,
        aiContext,
      },
    [
      pathway,
      playing,
      statusMap,
      progress,
      stepContextMap,
      updateStepContext,
      aiContext,
    ]
  );

  if (isLoading) {
    return (
      <div className={styles.app}>
        <Loading isLoading />
      </div>
    );
  }

  if (pathwayContext) {
    const isProject = view.kind === 'project';
    const {checkpoint} = pathwayContext;
    return (
      <div className={styles.app}>
        <PathwayContext.Provider value={pathwayContext}>
          <StepPlayer
            checkpoint={checkpoint}
            finishLabel={isProject ? 'Back to map' : undefined}
            onStartStep={startStep}
            onCompleteStep={completeStep}
            onLeaveStep={leaveStep}
            onSaveAnswers={saveAnswers}
            onExit={() =>
              setView({
                kind: 'map',
                focusId: isProject ? undefined : checkpoint.id,
              })
            }
            onFinish={() => setView({kind: 'map'})}
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
          setView({kind: 'step', checkpointId: id});
        }}
        onWorkOnProject={() => setView({kind: 'project'})}
        onReset={() => {
          reset();
          setView({kind: 'map'});
        }}
      />
    </div>
  );
};

export default PathwayApp;
