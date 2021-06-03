import React from 'react';
import PropTypes from 'prop-types';
import PaneHeader, {
  PaneSection,
  PaneButton
} from '@cdo/apps/templates/PaneHeader';
import CollapserIcon from '@cdo/apps/templates/CollapserIcon';

export default function PreviewPaneHeader({isCollapsed, isFullscreen}) {
  return (
    <PaneHeader hasFocus>
      <PaneButton
        headerHasFocus
        icon={<CollapserIcon isCollapsed={isCollapsed} />}
        onClick={() => {}}
        label=""
        isRtl={false}
        style={styles.transparent}
        leftJustified
      />
      {/* TODO: Uncomment iconClass and remove icon prop when we are ready to implement fullscreen. */}
      {/* The empty icon element keeps everything centered in the header pane. */}
      <PaneButton
        headerHasFocus
        // iconClass={isFullscreen ? 'fa fa-compress' : 'fa fa-arrows-alt'}
        icon={<span style={{width: 13}} />}
        onClick={() => {}}
        label=""
        isRtl={false}
        style={styles.transparent}
      />
      <PaneSection>Preview</PaneSection>
    </PaneHeader>
  );
}

PreviewPaneHeader.propTypes = {
  isCollapsed: PropTypes.bool.isRequired,
  isFullscreen: PropTypes.bool.isRequired
};

const styles = {
  transparent: {
    backgroundColor: 'transparent',
    ':hover': {
      backgroundColor: 'transparent'
    }
  }
};
