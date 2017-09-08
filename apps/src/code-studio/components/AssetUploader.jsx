/** @file Upload button wrapping a hidden uploader component. */
import React, {PropTypes} from 'react';
var HiddenUploader = require('./HiddenUploader.jsx');
import clientApi from '@cdo/apps/clientApi';
var assetsApi = clientApi.assets;
var filesApi = clientApi.files;

/**
 * A file upload component.
 */
var AssetUploader = React.createClass({
  propTypes: {
    onUploadStart: PropTypes.func.isRequired,
    onUploadDone: PropTypes.func.isRequired,
    onUploadError: PropTypes.func,
    allowedExtensions: PropTypes.string,
    uploadsEnabled: PropTypes.bool.isRequired,
    useFilesApi: PropTypes.bool
  },

  /**
   * We've hidden the <input type="file"/> and replaced it with a big button.
   * Forward clicks on the button to the hidden file input.
   */
  fileUploadClicked: function () {
    this.refs.uploader.openFileChooser();
  },

  render: function () {
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
});
module.exports = AssetUploader;
