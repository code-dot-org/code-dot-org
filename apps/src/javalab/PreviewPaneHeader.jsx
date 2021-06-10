import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import PaneHeader, {
  PaneSection,
  PaneButton
} from '@cdo/apps/templates/PaneHeader';
import CollapserIcon from '@cdo/apps/templates/CollapserIcon';

export default function PreviewPaneHeader({
  isCollapsed,
  isFullscreen,
  showAssetManagerButton = false,
  showPreviewTitle = true
}) {
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
      {showPreviewTitle && (
        <PaneSection style={styles.headerTitle}>{i18n.preview()}</PaneSection>
      )}
      {/* TODO: Uncomment fullscreen button when we are ready to implement fullscreen.
      <PaneButton
        headerHasFocus
        iconClass={isFullscreen ? 'fa fa-compress' : 'fa fa-arrows-alt'}
        onClick={() => {}}
        label=""
        isRtl={false}
        style={styles.transparent}
      />
       */}
      {showAssetManagerButton && (
        <PaneButton
          headerHasFocus
          onClick={() => {}}
          iconClass="fa fa-upload"
          label={i18n.manageAssets()}
          isRtl={false}
        />
      )}
    </PaneHeader>
  );
}

PreviewPaneHeader.propTypes = {
  isCollapsed: PropTypes.bool.isRequired,
  isFullscreen: PropTypes.bool.isRequired,
  showAssetManagerButton: PropTypes.bool,
  showPreviewTitle: PropTypes.bool
};

const styles = {
  transparent: {
    backgroundColor: 'transparent',
    ':hover': {
      backgroundColor: 'transparent'
    }
  }
};
