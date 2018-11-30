import React, {PropTypes} from 'react';
import AssetUploader from './AssetUploader';
import Button from "../../templates/Button";
import i18n from '@cdo/locale';

export const assetButtonStyles = {
  button: {
    paddingLeft: 10,
    paddingRight: 10,
    marginTop: 5,
    borderRadius: 4,
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
    useFilesApi: PropTypes.bool,
    onUploadStart: PropTypes.func.isRequired,
    onUploadDone: PropTypes.func.isRequired,
    onUploadError: PropTypes.func.isRequired,
    onSelectRecord: PropTypes.func.isRequired,
    statusMessage: PropTypes.string,
    recordDisabled: PropTypes.bool,
    hideAudioRecording: PropTypes.bool
  };

  render() {
    return (
      <div style={assetButtonStyles.buttonRow}>
        <AssetUploader
          uploadsEnabled={this.props.uploadsEnabled}
          allowedExtensions={this.props.allowedExtensions}
          useFilesApi={this.props.useFilesApi}
          onUploadStart={this.props.onUploadStart}
          onUploadDone={this.props.onUploadDone}
          onUploadError={this.props.onUploadError}
        />
        {!this.props.hideAudioRecording &&
          <RecordButton onSelectRecord={this.props.onSelectRecord} disabled={this.props.recordDisabled}/>
        }
        <span id="manage-asset-status">
          {this.props.statusMessage}
        </span>
      </div>
    );
  }
}
