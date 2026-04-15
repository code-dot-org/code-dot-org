import React from 'react';

import {LabProps, LevelProperties} from '@cdo/apps/lab2/types';
import SourcesContainer from '@cdo/apps/lab2/views/SourcesContainer';

import ExcalidrawSketchLabView, {
  DEFAULT_SOURCES,
} from './excalidraw/ExcalidrawSketchLabView';

export default (props: LabProps<LevelProperties>) => (
  <SourcesContainer
    {...props}
    defaultSources={DEFAULT_SOURCES}
    key={props.levelProperties.id}
  >
    <ExcalidrawSketchLabView levelProperties={props.levelProperties} />
  </SourcesContainer>
);
