import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import * as assets from '../code-studio/assets';
import PaneHeader, {
  PaneSection,
  PaneButton
} from '@cdo/apps/templates/PaneHeader';
import CollapserIcon from '@cdo/apps/templates/CollapserIcon';

export default function PreviewPaneHeader({
  isCollapsed,
  isFullscreen,
  toggleVisualizationCollapsed,
  disableAssetManagerButton = false,
  showAssetManagerButton = false,
  showPreviewTitle = true
}) {
  return (
    <PaneHeader hasFocus>
      <PaneButton
        headerHasFocus
        icon={<CollapserIcon isCollapsed={isCollapsed} />}
        onClick={toggleVisualizationCollapsed}
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
          onClick={() =>
            assets.showAssetManager(null, null, null, {
              customAllowedExtensions: '.wav, .jpg, .jpeg, .jfif, .png'
            })
          }
          iconClass="fa fa-upload"
          label={i18n.manageAssets()}
          isRtl={false}
          isDisabled={disableAssetManagerButton}
        />
      )}
    </PaneHeader>
  );
}

PreviewPaneHeader.propTypes = {
  isFullscreen: PropTypes.bool.isRequired,
  isCollapsed: PropTypes.bool.isRequired,
  showAssetManagerButton: PropTypes.bool,
  disableAssetManagerButton: PropTypes.bool,
  showPreviewTitle: PropTypes.bool,
  toggleVisualizationCollapsed: PropTypes.func
};

const styles = {
  transparent: {
    marginLeft: -4, // Adjust icon position to align with instructions collapser icon.
    backgroundColor: 'transparent',
    ':hover': {
      backgroundColor: 'transparent'
    }
  }
};
