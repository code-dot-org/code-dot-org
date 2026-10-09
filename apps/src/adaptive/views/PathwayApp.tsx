// Chooses which screen to show: the checkpoint map, one checkpoint's steps,
// or the project on its own. Owns the progress they share.

import React, {useCallback, useMemo, useState} from 'react';

import {AichatContext} from '@cdo/apps/aichat/types';
import Loading from '@cdo/apps/lab2/views/Loading';
import {AiChatClientTypes} from '@cdo/generated-scripts/sharedConstants';

import {useProgress} from '../progress';
import {ProgressKey} from '../progress/progressStore';
import {Checkpoint, Pathway} from '../types';

import MapScreen from './MapScreen';
import {PathwayContext} from './PathwayContext';
import StepPlayer from './steps/StepPlayer';
import {
  DEFAULT_UI_VARIANTS,
  UiVariants,
  UiVariantsContext,
  UiVariantsState,
} from './uiVariants';

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

  const [variants, setVariants] = useState<UiVariants>(DEFAULT_UI_VARIANTS);
  const setVariant = useCallback<UiVariantsState['setVariant']>(
    (key, value) => setVariants(v => ({...v, [key]: value})),
    []
  );
  const uiVariants = useMemo(
    () => ({variants, setVariant}),
    [variants, setVariant]
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
      <UiVariantsContext.Provider value={uiVariants}>
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
      </UiVariantsContext.Provider>
    </div>
  );
};

export default PathwayApp;
