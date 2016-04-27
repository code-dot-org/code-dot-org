/** @file Upload button wrapping a hidden uploader component. */
'use strict';

var HiddenUploader = require('./HiddenUploader.jsx');

/**
 * A file upload component.
 */
var AssetUploader = React.createClass({
  propTypes: {
    onUploadStart: React.PropTypes.func.isRequired,
    onUploadDone: React.PropTypes.func.isRequired,
    onUploadError: React.PropTypes.func,
    channelId: React.PropTypes.string.isRequired,
    allowedExtensions: React.PropTypes.string,
    uploadsEnabled: React.PropTypes.bool.isRequired
  },

  /**
   * We've hidden the <input type="file"/> and replaced it with a big button.
   * Forward clicks on the button to the hidden file input.
   */
  fileUploadClicked: function () {
    this.refs.uploader.openFileChooser();
  },

  render: function () {
    return (
      <span>
        <HiddenUploader
            ref="uploader"
            toUrl={'/v3/assets/' + this.props.channelId + '/'}
            allowedExtensions={this.props.allowedExtensions}
            onUploadStart={this.props.onUploadStart}
            onUploadDone={this.props.onUploadDone}
            onUploadError={this.props.onUploadError} />
        <button
            onClick={this.fileUploadClicked}
            className="share"
            id="upload-asset"
            disabled={!this.props.uploadsEnabled}>
          <i className="fa fa-upload" />
          &nbsp;Upload File
        </button>
      </span>
    );
  }
});
module.exports = AssetUploader;
