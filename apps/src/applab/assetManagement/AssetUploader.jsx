
/**
 * A component for managing hosted assets.
 */
module.exports = React.createClass({
  propTypes: {
    onUpload: React.PropTypes.func.isRequired,
    typeFilter: React.PropTypes.string,
    uploadsEnabled: React.PropTypes.bool.isRequired
  },

  upload: function () {
    this.props.onUpload(this.refs.uploader);
  },

  /**
   * We've hidden the <input type="file"/> and replaced it with a big button.
   * Forward clicks on the button to the hidden file input.
   */
  fileUploadClicked: function () {
    var uploader = React.findDOMNode(this.refs.uploader);
    uploader.click();
  },

  render: function () {
    return (
      <div>
        <input
            ref="uploader"
            type="file"
            accept={(this.props.typeFilter || '*') + '/*'}
            style={{display: 'none'}}
            onChange={this.upload} />
        <button
            onClick={this.fileUploadClicked}
            className="share"
            id="upload-asset"
            disabled={!this.props.uploadsEnabled}>
          <i className="fa fa-upload"></i>
          &nbsp;Upload File
        </button>
      </div>
    );
  }
});
