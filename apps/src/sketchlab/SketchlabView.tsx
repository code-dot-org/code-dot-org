import {isEqual, omit} from 'lodash';
import React from 'react';

import {
  LabProps,
  LevelProperties,
  ProjectSources,
  SketchlabReactFlowSource,
} from '@cdo/apps/lab2/types';
import SourcesContainer from '@cdo/apps/lab2/views/SourcesContainer';
import experiments from '@cdo/apps/util/experiments';

import ExcalidrawSketchLabView, {
  DEFAULT_SOURCES,
} from './excalidraw/ExcalidrawSketchLabView';
import ReactFlowSketchLabView, {
  REACT_FLOW_DEFAULT_SOURCES,
} from './reactFlow/ReactFlowSketchLabView';

function isReactFlowSource(
  source: ProjectSources['source']
): source is SketchlabReactFlowSource {
  return (
    typeof source === 'object' &&
    source !== null &&
    Array.isArray((source as SketchlabReactFlowSource).nodes) &&
    Array.isArray((source as SketchlabReactFlowSource).edges)
  );
}

export default function SketchlabView(props: LabProps<LevelProperties>) {
  // Legacy version of Sketch Lab is behind a flag for now, so we can check on old behavior.
  const useExcalidraw = experiments.isEnabledAllowingQueryString(
    experiments.EXCALIDRAW
  );
  const defaultSources = useExcalidraw
    ? DEFAULT_SOURCES
    : REACT_FLOW_DEFAULT_SOURCES;
  const InnerView = useExcalidraw
    ? ExcalidrawSketchLabView
    : ReactFlowSketchLabView;

  // Function to tell SourcesContainer whether the sources have changed in a way
  // that should trigger a progress report update. Skipped for legacy Excalidraw.
  // For React Flow, we ignore viewport changes, as those are not a meaningful edit.
  const sourcesChanged = useExcalidraw
    ? undefined
    : (prevSources: ProjectSources, newSources: ProjectSources) => {
        const prev = prevSources.source;
        const next = newSources.source;
        if (!isReactFlowSource(prev) || !isReactFlowSource(next)) {
          return false;
        }
        return !isEqual(omit(prev, 'viewport'), omit(next, 'viewport'));
      };

  return (
    <SourcesContainer
      {...props}
      defaultSources={defaultSources}
      key={props.levelProperties.id}
      checkSourcesChangedForProgressReport={sourcesChanged}
    >
      <InnerView levelProperties={props.levelProperties} />
    </SourcesContainer>
  );
}
