
/**
 * A component for managing hosted assets.
 */
module.exports = React.createClass({
  propTypes: {
    onUploadStart: React.PropTypes.func.isRequired,
    onUploadDone: React.PropTypes.func.isRequired,
    typeFilter: React.PropTypes.string,
    uploadsEnabled: React.PropTypes.bool.isRequired
  },

  componentDidMount: function () {
    var props = this.props;

    $(React.findDOMNode(this.refs.uploader)).fileupload({
      dataType: 'json',
      url: '/v3/assets/' + Applab.channelId + '/new',
      // prevent fileupload from replacing the input DOM element, which
      // React does not like
      replaceFileInput: false,
      add: function (e, data) {
        props.onUploadStart();
        data.submit();
      },
      done: function (e, data) {
        props.onUploadDone(data.result);
      }
    });
  },

  componentWillUnmount: function () {
    // TODO - test open/closing dialog. make sure we do the right thing
    $(React.findDOMNode(this.refs.uploader)).fileupload('destroy');
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
    // TODO - channelId as prop?
    // NOTE: IE9 will ignore accept, which means on this browser we can end
    // up uploading files that dont match typeFilter
    return (
      <span>
        <input
            ref="uploader"
            type="file"
            style={{display: 'none'}}
            accept={(this.props.typeFilter || '*') + '/*'}/>
        <button
            onClick={this.fileUploadClicked}
            className="share"
            id="upload-asset"
            disabled={!this.props.uploadsEnabled}>
          <i className="fa fa-upload"></i>
          &nbsp;Upload File
        </button>
      </span>
    );
  }
});
