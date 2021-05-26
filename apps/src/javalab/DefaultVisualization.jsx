import React from 'react';
import PaneHeader, {
  PaneSection,
  PaneButton
} from '@cdo/apps/templates/PaneHeader';
import CollapserIcon from '@cdo/apps/templates/CollapserIcon';
import ProtectedVisualizationDiv from '@cdo/apps/templates/ProtectedVisualizationDiv';

export default class DefaultVisualization extends React.Component {
  state = {
    isCollapsed: false
  };

  render() {
    return (
      <PaneHeader hasFocus>
        <PaneButton
          headerHasFocus
          icon={<CollapserIcon isCollapsed={false} />}
          onClick={() => {}}
          label=""
          isRtl={false}
          style={styles.transparent}
          leftJustified
        />
        <PaneButton
          headerHasFocus
          iconClass="fa fa-expand" // TODO: figure out correct icon
          onClick={() => {}}
          label=""
          isRtl={false}
          style={styles.transparent}
        />
        <PaneSection>Preview</PaneSection>
        <ProtectedVisualizationDiv />
      </PaneHeader>
    );
  }
}

const styles = {
  transparent: {
    backgroundColor: 'transparent',
    ':hover': {
      backgroundColor: 'transparent'
    }
  }
};
