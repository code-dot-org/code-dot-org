import React from 'react';
import PaneHeader, {PaneSection} from '@cdo/apps/templates/PaneHeader';
import ProtectedVisualizationDiv from '@cdo/apps/templates/ProtectedVisualizationDiv';

export default class DefaultVisualization extends React.Component {
  render() {
    return (
      <PaneHeader hasFocus>
        <PaneSection>Preview</PaneSection>
        <ProtectedVisualizationDiv />
      </PaneHeader>
    );
  }
}
