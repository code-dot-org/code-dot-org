/** @file Hidden file input with interface for handling uploads. */
'use strict';

var commonStyles = require('../commonStyles');

/**
 * A hidden file input providing upload functionality with event hooks.
 */
var HiddenUploader = React.createClass({
  propTypes: {
    toUrl: React.PropTypes.string.isRequired,
    typeFilter: React.PropTypes.string,
    onUploadStart: React.PropTypes.func.isRequired,
    onUploadDone: React.PropTypes.func.isRequired,
    onUploadError: React.PropTypes.func
  },

  componentDidMount: function () {
    var props = this.props;

    $(this.refs.uploader).fileupload({
      dataType: 'json',
      url: this.props.toUrl,
      // prevent fileupload from replacing the input DOM element, which
      // React does not like
      replaceFileInput: false,
      add: function (e, data) {
        props.onUploadStart(data);
        data.submit();
      },
      done: function (e, data) {
        props.onUploadDone(data.result);
      },
      error: function (e, data) {
        if (props.onUploadError) {
          props.onUploadError(e.status);
        }
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
    // up uploading files that don't match typeFilter; for this reason, the
    // server should also validate allowed file types.
    return <input
        ref="uploader"
        type="file"
        style={commonStyles.hidden}
        accept={(this.props.typeFilter || '*') + '/*'}/>;
  }
});
module.exports = HiddenUploader;
