import PropTypes from 'prop-types';
import React from 'react';

import CollapserIcon from '@cdo/apps/templates/CollapserIcon';
import PaneHeader, {
  PaneSection,
  PaneButton,
} from '@cdo/apps/templates/PaneHeader';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';

import * as assets from '../code-studio/assets';
import {RecordingFileType} from '../code-studio/components/recorders';

export default function PreviewPaneHeader({
  isCollapsed,
  isFullscreen,
  toggleVisualizationCollapsed,
  disableAssetManagerButton = false,
  showAssetManagerButton = false,
  showPreviewTitle = true,
}) {
  return (
    <PaneHeader hasFocus style={{display: 'flex'}} isOldPurpleColor>
      <PaneSection className={'pane-header-section pane-header-section-left'}>
        <PaneButton
          headerHasFocus
          icon={
            <CollapserIcon
              isCollapsed={isCollapsed}
              style={styles.collapserIcon}
            />
          }
          onClick={toggleVisualizationCollapsed}
          label=""
          isRtl={false}
          style={styles.transparent}
          leftJustified
          ariaLabel={isCollapsed ? i18n.showPreview() : i18n.hidePreview()}
        />
      </PaneSection>
      <PaneSection className={'pane-header-section pane-header-section-center'}>
        {showPreviewTitle && (
          <PaneSection style={styles.headerTitle}>{i18n.preview()}</PaneSection>
        )}
      </PaneSection>
      {/* This overflowX styling should ideally be in style.scss.
          See that file for more details.
       */}
      <PaneSection
        className={'pane-header-section pane-header-section-right'}
        style={{overflowX: 'visible'}}
      >
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
                customAllowedExtensions: '.wav, .jpg, .jpeg, .jfif, .png',
                recordingFileType: RecordingFileType.WAV,
              })
            }
            iconClass="fa fa-upload"
            label={i18n.manageAssets()}
            isRtl={false}
            isDisabled={disableAssetManagerButton}
          />
        )}
      </PaneSection>
    </PaneHeader>
  );
}

PreviewPaneHeader.propTypes = {
  isFullscreen: PropTypes.bool.isRequired,
  isCollapsed: PropTypes.bool.isRequired,
  showAssetManagerButton: PropTypes.bool,
  disableAssetManagerButton: PropTypes.bool,
  showPreviewTitle: PropTypes.bool,
  toggleVisualizationCollapsed: PropTypes.func,
};

const styles = {
  transparent: {
    marginLeft: -4, // Adjust icon position to align with instructions collapser icon.
    backgroundColor: 'transparent',
    ':hover': {
      backgroundColor: 'transparent',
    },
  },
  collapserIcon: {
    color: color.white,
  },
};
