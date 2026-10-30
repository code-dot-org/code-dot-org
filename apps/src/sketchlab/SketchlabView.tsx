import {isEqual, omit} from 'lodash';
import React from 'react';

import {useLevelActivityMetrics} from '@cdo/apps/lab2/hooks/useLevelActivityMetrics';
import {
  LabProps,
  LevelProperties,
  ProjectSources,
  SketchlabReactFlowSource,
} from '@cdo/apps/lab2/types';
import SourcesContainer from '@cdo/apps/lab2/views/SourcesContainer';

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
  const logLevelActivity = useLevelActivityMetrics(props.levelProperties);

  // Tell SourcesContainer whether the sources changed in a way that should
  // trigger a progress report update. We ignore viewport changes and per-item
  // selection state, as those are not meaningful edits.
  const sourcesChanged = (
    prevSources: ProjectSources,
    newSources: ProjectSources
  ) => {
    const prev = prevSources.source;
    const next = newSources.source;
    if (!isReactFlowSource(prev) || !isReactFlowSource(next)) {
      return false;
    }
    const normalize = (s: SketchlabReactFlowSource) => ({
      ...omit(s, 'viewport'),
      nodes: s.nodes.map(n => omit(n, 'selected')),
      edges: s.edges.map(e => omit(e, 'selected')),
    });
    return !isEqual(normalize(prev), normalize(next));
  };

  return (
    <SourcesContainer
      {...props}
      defaultSources={REACT_FLOW_DEFAULT_SOURCES}
      key={props.levelProperties.id}
      checkSourcesChangedForProgressReport={sourcesChanged}
      onMeaningfulSourceChange={logLevelActivity}
    >
      <ReactFlowSketchLabView levelProperties={props.levelProperties} />
    </SourcesContainer>
  );
}
