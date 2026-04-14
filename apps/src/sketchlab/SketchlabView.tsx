import React from 'react';

import {LabProps, LevelProperties} from '@cdo/apps/lab2/types';
import SourcesContainer from '@cdo/apps/lab2/views/SourcesContainer';
import experiments from '@cdo/apps/util/experiments';

import SketchlabExcalidrawView, {
  EXCALIDRAW_DEFAULT_SOURCES,
} from './excalidraw/SketchlabExcalidrawView';
import SketchlabReactFlowView, {
  REACTFLOW_DEFAULT_SOURCES,
} from './reactflow/SketchlabReactFlowView';

// Sketch Lab has two implementations: the original Excalidraw one, and a
// newer React Flow one ("Sketch 2") that's gated behind the SKETCH2
// experiment. The React Flow implementation knows how to migrate
// an Excalidraw source on the fly, so existing student work and starter
// sources keep working when a level opts into the experiment.
//
// The two implementations live under ./excalidraw/ and ./reactflow/ so
// that one can be removed without touching the other.
export default (props: LabProps<LevelProperties>) => {
  const useReactFlow = experiments.isEnabledAllowingQueryString(
    experiments.SKETCH2
  );
  const defaultSources = useReactFlow
    ? REACTFLOW_DEFAULT_SOURCES
    : EXCALIDRAW_DEFAULT_SOURCES;
  return (
    <SourcesContainer
      {...props}
      defaultSources={defaultSources}
      key={props.levelProperties.id}
    >
      {useReactFlow ? (
        <SketchlabReactFlowView levelProperties={props.levelProperties} />
      ) : (
        <SketchlabExcalidrawView levelProperties={props.levelProperties} />
      )}
    </SourcesContainer>
  );
};
