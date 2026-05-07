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
  // Legacy version of Sketch Lab is behind a flag for now, so we can check on old behavior.
  const useExcalidraw = experiments.isEnabledAllowingQueryString('excalidraw');
  const defaultSources = useExcalidraw
    ? DEFAULT_SOURCES
    : REACT_FLOW_DEFAULT_SOURCES;
  const InnerView = useExcalidraw
    ? ExcalidrawSketchLabView
    : ReactFlowSketchLabView;

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
