
/**
 * A component for managing hosted assets.
 */
module.exports = React.createClass({
  propTypes: {
    onUpload: React.PropTypes.func.isRequired,
    typeFilter: React.PropTypes.string,
    uploadsEnabled: React.PropTypes.bool.isRequired
  },

  componentDidMount: function () {
    $(React.findDOMNode(this.refs.uploader)).fileupload({
        dataType: 'json',
        // prevent fileupload from replacing the input DOM element, which
        // React does not like
        replaceFileInput: false,
        done: function (e, data) {
          console.log('done');
          // $.each(data.result.files, function (index, file) {
          //     $('<p/>').text(file.name).appendTo(document.body);
          // });
        }
    });
  },

  componentWillUnmount: function () {
    // TODO - test open/closing dialog. make sure we do the right thing
    $(React.findDOMNode(this.refs.uploader)).fileupload('destroy');
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
    // TODO - channelId as prop?
    var dataUrl = '/v3/assets/' + Applab.channelId + '/new';
    // return <input ref="fileupload" id="fileupload" type="file" name="files[]" data-url={dataUrl} multiple/>;
    // TODO - do i need "multiple"?
    return (
      <span>
        <input
            ref="uploader"
            data-url={dataUrl}
            type="file"
            multiple={true}
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
      </span>
    );
  }
});
