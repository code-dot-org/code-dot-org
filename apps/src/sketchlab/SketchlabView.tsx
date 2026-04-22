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
  const useReactFlow = experiments.isEnabledAllowingQueryString('sketch2');
  const defaultSources = useReactFlow
    ? REACT_FLOW_DEFAULT_SOURCES
    : DEFAULT_SOURCES;
  const InnerView = useReactFlow
    ? ReactFlowSketchLabView
    : ExcalidrawSketchLabView;

  return (
    <SourcesContainer
      {...props}
      defaultSources={defaultSources}
      key={props.levelProperties.id}
    >
      <InnerView levelProperties={props.levelProperties} />
    </SourcesContainer>
  );
}
