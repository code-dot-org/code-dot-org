/** @file Upload button wrapping a hidden uploader component. */
var React = require('react');
var HiddenUploader = require('./HiddenUploader.jsx');
import clientApi from '@cdo/apps/clientApi';
var assetsApi = clientApi.assets;
var filesApi = clientApi.files;

/**
 * A file upload component.
 */
var AssetUploader = React.createClass({
  propTypes: {
    onUploadStart: React.PropTypes.func.isRequired,
    onUploadDone: React.PropTypes.func.isRequired,
    onUploadError: React.PropTypes.func,
    allowedExtensions: React.PropTypes.string,
    uploadsEnabled: React.PropTypes.bool.isRequired,
    useFilesApi: React.PropTypes.bool
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
