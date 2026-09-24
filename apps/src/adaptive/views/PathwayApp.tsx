// Shows the checkpoint map and owns the progress and project state the
// map's cards read and edit. Starting a checkpoint only marks it started
// until a step player exists.

import React, {useState} from 'react';

import {useProgress} from '../progress';
import {useProject} from '../project';
import {Pathway} from '../types';

import MapScreen from './MapScreen';

import styles from './shared.module.scss';

interface PathwayAppProps {
  pathway: Pathway;
}

const PathwayApp: React.FunctionComponent<PathwayAppProps> = ({pathway}) => {
  const {statusMap, markStarted, reset} = useProgress(pathway);
  const {project, editProject, reset: resetProject} = useProject(pathway);
  const [focusId, setFocusId] = useState<string | undefined>();

  return (
    <div className={styles.app}>
      <MapScreen
        pathway={pathway}
        statusMap={statusMap}
        project={project}
        focusId={focusId}
        onFocus={setFocusId}
        onStart={markStarted}
        onEditProject={editProject}
        onReset={() => {
          reset();
          resetProject();
          setFocusId(undefined);
        }}
      />
    </div>
  );
};

export default PathwayApp;
