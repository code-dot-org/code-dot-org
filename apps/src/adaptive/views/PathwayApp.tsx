// Chooses which screen to show, the checkpoint map or one checkpoint's
// steps, and owns the progress they share.

import React, {useState} from 'react';

import {useProgress} from '../progress';
import {useProject} from '../project';
import {Pathway} from '../types';

import MapScreen from './MapScreen';
import StepPlayer from './steps/StepPlayer';

import styles from './shared.module.scss';

type View =
  | {kind: 'map'; focusId?: string}
  | {kind: 'step'; checkpointId: string};

interface PathwayAppProps {
  pathway: Pathway;
}

const PathwayApp: React.FunctionComponent<PathwayAppProps> = ({pathway}) => {
  const {statusMap, markStarted, markComplete, reset} = useProgress(pathway);
  const {project, editProject, reset: resetProject} = useProject(pathway);
  const [view, setView] = useState<View>({kind: 'map'});
  const checkpointById = (id: string) =>
    pathway.checkpoints.find(c => c.id === id);

  const checkpoint =
    view.kind === 'step' ? checkpointById(view.checkpointId) : undefined;

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
          project={project}
          focusId={view.kind === 'map' ? view.focusId : undefined}
          onFocus={focusId => setView({kind: 'map', focusId})}
          onStart={id => {
            markStarted(id);
            setView({kind: 'step', checkpointId: id});
          }}
          onEditProject={editProject}
          onReset={() => {
            reset();
            resetProject();
            setView({kind: 'map'});
          }}
        />
      )}
    </div>
  );
};

export default PathwayApp;
