/** @file Upload button wrapping a hidden uploader component. */
import React, {PropTypes} from 'react';
import HiddenUploader from './HiddenUploader.jsx';
import {assets as assetsApi, files as filesApi} from '@cdo/apps/clientApi';

/**
 * A file upload component.
 */
export default class AssetUploader extends React.Component {
  static propTypes = {
    onUploadStart: PropTypes.func.isRequired,
    onUploadDone: PropTypes.func.isRequired,
    onUploadError: PropTypes.func,
    allowedExtensions: PropTypes.string,
    uploadsEnabled: PropTypes.bool.isRequired,
    useFilesApi: PropTypes.bool
  };

  /**
   * We've hidden the <input type="file"/> and replaced it with a big button.
   * Forward clicks on the button to the hidden file input.
   */
  fileUploadClicked = () => this.refs.uploader.openFileChooser();

  render() {
    let api = this.props.useFilesApi ? filesApi : assetsApi;
    let url = api.getUploadUrl();
    let uploadDone = api.wrapUploadDoneCallback(this.props.onUploadDone);
    let uploadStart = api.wrapUploadStartCallback(this.props.onUploadStart);
    return (
      <span>
        <HiddenUploader
          ref="uploader"
          toUrl={url}
          allowedExtensions={this.props.allowedExtensions}
          useFilesApi={this.props.useFilesApi}
          onUploadStart={uploadStart}
          onUploadDone={uploadDone}
          onUploadError={this.props.onUploadError}
        />
        <button
          onClick={this.fileUploadClicked}
          className="share"
          id="upload-asset"
          disabled={!this.props.uploadsEnabled}
        >
          <i className="fa fa-upload" />
          &nbsp;Upload File
        </button>
      </span>
    );
  }
}
