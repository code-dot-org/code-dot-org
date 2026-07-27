import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

import {isIE11} from '@cdo/apps/util/browser-detector';
import i18n from '@cdo/locale';

import AssetUploader from './AssetUploader';

export const assetButtonStyles = {
  button: {
    paddingLeft: 10,
    paddingRight: 10,
    marginTop: 5,
    fontSize: 'large',
    fontWeight: 'lighter',
    marginRight: 10,
  },
  buttonRow: {
    display: 'flex',
    flexFlow: 'row',
    alignItems: 'center',
    gap: 10,
  },
};

const RecordButton = ({onSelectRecord, disabled}) => (
  <MuiButton
    variant="contained"
    color="primary"
    size="medium"
    onClick={onSelectRecord}
    id="record-asset"
    disabled={disabled}
    startIcon={<FontAwesomeV6Icon iconName="microphone" iconStyle="solid" />}
  >
    {i18n.recordAudio()}
  </MuiButton>
);

RecordButton.propTypes = {
  onSelectRecord: PropTypes.func,
  disabled: PropTypes.bool,
};

/**
 * A component for the buttons that enable adding an asset to a project.
 */
export default class AddAssetButtonRow extends React.Component {
  static propTypes = {
    uploadsEnabled: PropTypes.bool.isRequired,
    allowedExtensions: PropTypes.string,
    api: PropTypes.object,
    onUploadStart: PropTypes.func.isRequired,
    onUploadDone: PropTypes.func.isRequired,
    onUploadError: PropTypes.func.isRequired,
    onSelectRecord: PropTypes.func.isRequired,
    statusMessage: PropTypes.string,
    recordDisabled: PropTypes.bool,
    hideAudioRecording: PropTypes.bool,
    projectType: PropTypes.string.isRequired,
  };

  render() {
    let shouldShowRecordButton = !this.props.hideAudioRecording;
    if (isIE11()) {
      shouldShowRecordButton = false;
    }
    return (
      <div style={assetButtonStyles.buttonRow}>
        <AssetUploader
          uploadsEnabled={this.props.uploadsEnabled}
          allowedExtensions={this.props.allowedExtensions}
          api={this.props.api}
          onUploadStart={this.props.onUploadStart}
          onUploadDone={this.props.onUploadDone}
          onUploadError={this.props.onUploadError}
          projectType={this.props.projectType}
        />
        {shouldShowRecordButton && (
          <RecordButton
            onSelectRecord={this.props.onSelectRecord}
            disabled={!this.props.uploadsEnabled || this.props.recordDisabled}
          />
        )}
        <span id="manage-asset-status">{this.props.statusMessage}</span>
      </div>
    );
  }
}
