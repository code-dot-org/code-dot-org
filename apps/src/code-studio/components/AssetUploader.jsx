/** @file Upload button wrapping a hidden uploader component. */
var React = require('react');
var HiddenUploader = require('./HiddenUploader.jsx');
import {assets, files as assetsApi, filesApi} from '@cdo/apps/clientApi';

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
    useFilesApi: React.PropTypes.bool.isRequired
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
    return (
      <span>
        <HiddenUploader
          ref="uploader"
          toUrl={`${api.basePath()}/`}
          allowedExtensions={this.props.allowedExtensions}
          useFilesApi={this.props.useFilesApi}
          onUploadStart={this.props.onUploadStart}
          onUploadDone={this.props.onUploadDone}
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
