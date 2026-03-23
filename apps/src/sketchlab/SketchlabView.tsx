import React from 'react';

import {LabProps, LevelProperties} from '@cdo/apps/lab2/types';
import SourcesContainer from '@cdo/apps/lab2/views/SourcesContainer';
import experiments from '@cdo/apps/util/experiments';

import SketchLabExcalidrawView, {
  DEFAULT_SOURCES,
} from './SketchLabExcalidrawView';
import SketchLabTldrawView from './SketchLabTldrawView';

export default (props: LabProps<LevelProperties>) => {
  if (experiments.isEnabledAllowingQueryString(experiments.TLDRAW)) {
    return <SketchLabTldrawView {...props} />;
  }
  return (
    <SourcesContainer
      {...props}
      defaultSources={DEFAULT_SOURCES}
      key={props.levelProperties.id}
    >
      <SketchLabExcalidrawView levelProperties={props.levelProperties} />
    </SourcesContainer>
  );
};
