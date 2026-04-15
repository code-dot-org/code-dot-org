import React from 'react';

import {LabProps, LevelProperties} from '@cdo/apps/lab2/types';
import SourcesContainer from '@cdo/apps/lab2/views/SourcesContainer';
import experiments from '@cdo/apps/util/experiments';

import ExcalidrawSketchLabView, {
  DEFAULT_SOURCES,
} from './excalidraw/ExcalidrawSketchLabView';
import ReactFlowSketchLabView, {
  REACT_FLOW_DEFAULT_SOURCES,
} from './reactFlow/ReactFlowSketchLabView';

export default function SketchlabView(props: LabProps<LevelProperties>) {
  if (experiments.isEnabledAllowingQueryString('sketch2')) {
    return (
      <SourcesContainer
        {...props}
        defaultSources={REACT_FLOW_DEFAULT_SOURCES}
        key={props.levelProperties.id}
      >
        <ReactFlowSketchLabView levelProperties={props.levelProperties} />
      </SourcesContainer>
    );
  }
  return (
    <SourcesContainer
      {...props}
      defaultSources={DEFAULT_SOURCES}
      key={props.levelProperties.id}
    >
      <ExcalidrawSketchLabView levelProperties={props.levelProperties} />
    </SourcesContainer>
  );
}
