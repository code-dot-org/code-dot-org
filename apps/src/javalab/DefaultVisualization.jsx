import React from 'react';
import PaneHeader, {
  PaneSection,
  PaneButton
} from '@cdo/apps/templates/PaneHeader';
import CollapserIcon from '@cdo/apps/templates/CollapserIcon';
import ProtectedVisualizationDiv from '@cdo/apps/templates/ProtectedVisualizationDiv';

export default class DefaultVisualization extends React.Component {
  state = {
    isCollapsed: false,
    isFullscreen: false
  };

  fullscreenIcon = () => {
    return this.state.isFullscreen ? 'fa fa-compress' : 'fa fa-arrows-alt';
  };

  render() {
    return (
      <PaneHeader hasFocus>
        <PaneButton
          headerHasFocus
          icon={<CollapserIcon isCollapsed={this.state.isCollapsed} />}
          onClick={() => {}}
          label=""
          isRtl={false}
          style={styles.transparent}
          leftJustified
        />
        <PaneButton
          headerHasFocus
          iconClass={this.fullscreenIcon()}
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
