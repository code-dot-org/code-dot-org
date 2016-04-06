/** @file Hidden file input with interface for handling uploads. */
'use strict';

/**
 * A hidden file input providing upload functionality with event hooks.
 */
var HiddenUploader = React.createClass({
  propTypes: {
    onUploadStart: React.PropTypes.func.isRequired,
    onUploadDone: React.PropTypes.func.isRequired,
    onUploadError: React.PropTypes.func,
    channelId: React.PropTypes.string.isRequired,
    typeFilter: React.PropTypes.string
  },

  componentDidMount: function () {
    var props = this.props;

    $(this.refs.uploader).fileupload({
      dataType: 'json',
      url: '/v3/assets/' + props.channelId + '/',
      // prevent fileupload from replacing the input DOM element, which
      // React does not like
      replaceFileInput: false,
      add: function (e, data) {
        props.onUploadStart();
        data.submit();
      },
      done: function (e, data) {
        props.onUploadDone(data.result);
      },
      error: function (e, data) {
        props.onUploadError(e.status);
      }
    });
  },

  componentWillUnmount: function () {
    $(this.refs.uploader).fileupload('destroy');
  },

  openFileChooser: function () {
    this.refs.uploader.click();
  },

  render: function () {
    // NOTE: IE9 will ignore accept, which means on this browser we can end
    // up uploading files that dont match typeFilter
    return <input
        ref="uploader"
        type="file"
        style={{display: 'none'}}
        accept={(this.props.typeFilter || '*') + '/*'}/>;
  }
});
module.exports = HiddenUploader;
