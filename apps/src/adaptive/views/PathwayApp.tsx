// Chooses which screen to show: the checkpoint map, one checkpoint's steps,
// or the project on its own. Owns the progress they share.

import React, {useMemo, useState} from 'react';

import {useProgress} from '../progress';
import {Checkpoint, Pathway} from '../types';

import MapScreen from './MapScreen';
import StepPlayer from './steps/StepPlayer';

import styles from './shared.module.scss';

type View =
  | {kind: 'map'; focusId?: string}
  | {kind: 'step'; checkpointId: string}
  | {kind: 'project'};

interface PathwayAppProps {
  pathway: Pathway;
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

const PathwayApp: React.FunctionComponent<PathwayAppProps> = ({pathway}) => {
  const {statusMap, markStarted, markComplete, reset} = useProgress(pathway);
  const [view, setView] = useState<View>({kind: 'map'});
  const project = useMemo(() => projectCheckpoint(pathway), [pathway]);

  const checkpoint =
    view.kind === 'step'
      ? pathway.checkpoints.find(c => c.id === view.checkpointId)
      : undefined;

  if (view.kind === 'project') {
    return (
      <div className={styles.app}>
        <StepPlayer
          checkpoint={project}
          finishLabel="Back to map"
          onExit={() => setView({kind: 'map'})}
          onFinish={() => setView({kind: 'map'})}
        />
      </div>
    );
  }

  return (
    <div className={styles.app}>
      {checkpoint ? (
        <StepPlayer
          checkpoint={checkpoint}
          onExit={() => setView({kind: 'map', focusId: checkpoint.id})}
          onFinish={() => {
            markComplete(checkpoint.id);
            setView({kind: 'map'});
          }}
        />
      ) : (
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
      )}
    </div>
  );
};

export default PathwayApp;
