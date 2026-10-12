// Chooses which screen to show: the checkpoint map, one checkpoint's steps,
// or the project on its own. Owns the progress they share.

import React, {useEffect, useMemo, useState} from 'react';

import {setAiGatewayOptIn} from '@cdo/apps/aichat/api/shouldUseAiGateway';
import {AichatContext} from '@cdo/apps/aichat/types';
import {setSimpleProgress} from '@cdo/apps/code-studio/simpleProgressRedux';
import Loading from '@cdo/apps/lab2/views/Loading';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import {AiChatClientTypes} from '@cdo/generated-scripts/sharedConstants';

import {isAdaptiveAiEnabled} from '../ai/generate';
import {useProgress} from '../progress';
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
        id: 'project',
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
  const {
    progress,
    statusMap,
    isLoading,
    markStarted,
    markComplete,
    updateStepContext,
    saveAnswers,
    reset,
  } = useProgress(pathway, progressKey);
  const [view, setView] = useState<View>({kind: 'map'});
  const project = useMemo(() => projectCheckpoint(pathway), [pathway]);
  // On the map, the level header's simple progress shows the checkpoints
  // complete; a playing checkpoint reports its own steps instead.
  const dispatch = useAppDispatch();
  const completedCount = progress?.completed.length ?? 0;
  useEffect(() => {
    if (view.kind !== 'map' || !progress) {
      return;
    }
    dispatch(
      setSimpleProgress({
        label: pathway.title,
        position: completedCount,
        total: pathway.checkpoints.length,
        valueText: `${completedCount} of ${pathway.checkpoints.length} checkpoints complete`,
      })
    );
    return () => {
      dispatch(setSimpleProgress(null));
    };
  }, [dispatch, view.kind, progress, pathway, completedCount]);
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
      playing &&
      progress && {
        pathway,
        checkpoint: playing,
        statusMap,
        stepContextMap: progress.stepContext,
        updateStepContext,
        aiContext,
      },
    [pathway, playing, statusMap, progress, updateStepContext, aiContext]
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
            onSaveAnswers={saveAnswers}
            onExit={() =>
              setView({
                kind: 'map',
                focusId: isProject ? undefined : checkpoint.id,
              })
            }
            onFinish={() => {
              if (!isProject) markComplete(checkpoint.id);
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
          markStarted(id);
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
