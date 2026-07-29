import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {
  IconButton as MuiIconButton,
  Typography as MuiTypography,
} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

import PaneHeader, {
  PaneSection,
  PaneButton,
} from '@cdo/apps/templates/PaneHeader';
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
    <PaneHeader
      style={{
        backgroundColor: '#7665a0',
        paddingLeft: '0.125rem',
      }}
    >
      <PaneSection className={'pane-header-section pane-header-section-left'}>
        <MuiIconButton
          type="button"
          variant="outlined"
          color="secondary"
          size="extraSmall"
          onClick={toggleVisualizationCollapsed}
          aria-label={isCollapsed ? i18n.showPreview() : i18n.hidePreview()}
          aria-expanded={!isCollapsed}
          aria-controls="visualization"
          sx={{
            borderRadius: '50%',
            height: '1rem',
            width: '1rem',
          }}
        >
          <FontAwesomeV6Icon
            iconName={isCollapsed ? 'chevron-down' : 'chevron-up'}
            iconStyle="solid"
          />
        </MuiIconButton>
      </PaneSection>
      <PaneSection className={'pane-header-section pane-header-section-center'}>
        {showPreviewTitle && (
          <MuiTypography
            variant="body4"
            id="workspace-header-span"
            sx={{
              color: 'var(--text-neutral-white-fixed)',
              flex: '1 1 0',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              display: 'flex',
            }}
          >
            {i18n.preview()}
          </MuiTypography>
        )}
      </PaneSection>
      {/* This overflowX styling should ideally be in style.scss.
          See that file for more details.
       */}
      <PaneSection
        className={'pane-header-section pane-header-section-right'}
        style={{overflowX: 'visible'}}
      >
        {showAssetManagerButton && (
          <PaneButton
            headerHasFocus
            onClick={() =>
              assets.showAssetManager(null, null, null, {
                customAllowedExtensions: '.wav, .jpg, .jpeg, .jfif, .png',
                recordingFileType: RecordingFileType.WAV,
              })
            }
            iconProps={{iconName: 'upload', iconStyle: 'solid'}}
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
