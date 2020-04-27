import PropTypes from 'prop-types';
import React from 'react';
import AssetUploader from './AssetUploader';
import Button from '../../templates/Button';
import i18n from '@cdo/locale';
import {isIE11} from '@cdo/apps/util/browser-detector';

export const assetButtonStyles = {
  button: {
    paddingLeft: 10,
    paddingRight: 10,
    marginTop: 5,
    fontSize: 'large',
    fontWeight: 'lighter',
    marginRight: 10
  },
  buttonRow: {
    display: 'flex',
    flexFlow: 'row',
    alignItems: 'center'
  }
};

const RecordButton = ({onSelectRecord, disabled}) => (
  <span>
    <Button
      __useDeprecatedTag
      onClick={onSelectRecord}
      id="record-asset"
      className="share"
      text={i18n.recordAudio()}
      icon="microphone"
      style={assetButtonStyles.button}
      size="large"
      disabled={disabled}
    />
  </span>
);

RecordButton.propTypes = {
  onSelectRecord: PropTypes.func,
  disabled: PropTypes.bool
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
    hideAudioRecording: PropTypes.bool
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
