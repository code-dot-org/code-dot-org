/* eslint-disable react/no-is-mounted */
import React, {PropTypes} from 'react';
import AssetUploader from './AssetUploader';
import experiments from '@cdo/apps/util/experiments';
import Button from "../../templates/Button";
import i18n from '@cdo/locale';
import color from '@cdo/apps/util/color';

const RecordButton = ({onSelectRecord}) => (
  <Button
    onClick={onSelectRecord}
    id="record-asset"
    className="share"
    text={i18n.recordAudio()}
    icon="microphone"
    style={styles.buttonStyle}
    size="large"
  />
);

RecordButton.propTypes = {
  onSelectRecord: PropTypes.func,
};

const styles = {
  buttonRow: {
    display: 'flex',
    flexFlow: 'row',
  },
  buttonStyle: {
    paddingLeft: 10,
    paddingRight: 10,
    marginTop: 5,
    borderRadius: 4,
    fontSize: 'large',
    fontWeight: 'lighter',
    boxShadow: 'none',
    borderColor: color.orange
  }
};

/**
 * A component for the buttons that enable adding an asset to a project.
 */
export default class AddAssetButtonRow extends React.Component {
  static propTypes = {
    uploadsEnabled: PropTypes.func,
    allowedExtensions: PropTypes.func,
    useFilesApi: PropTypes.func,
    onUploadStart: PropTypes.func,
    onUploadDone: PropTypes.func,
    onUploadError: PropTypes.func,
    onSelectRecord: PropTypes.func,
    statusMessage: PropTypes.string,
  };

  render() {
    return (
      <div style={styles.buttonRow}>
        <div>
          <AssetUploader
            uploadsEnabled={this.props.uploadsEnabled}
            allowedExtensions={this.props.allowedExtensions}
            useFilesApi={this.props.useFilesApi}
            onUploadStart={this.props.onUploadStart}
            onUploadDone={this.props.onUploadDone}
            onUploadError={this.props.onUploadError}
          />
          {experiments.isEnabled('recordAudio') && <RecordButton onSelectRecord={this.props.onSelectRecord}/>}
          <span style={{margin: '0 10px'}} id="manage-asset-status">
            {this.props.statusMessage}
          </span>
        </div>
      </div>
    );
  }
}
