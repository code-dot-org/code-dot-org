/** @file Hidden file input with interface for handling uploads. */
import $ from 'jquery';
import React, {PropTypes} from 'react';

/**
 * A hidden file input providing upload functionality with event hooks.
 */
export default class HiddenUploader extends React.Component {
  static propTypes = {
    toUrl: PropTypes.string.isRequired,
    allowedExtensions: PropTypes.string,
    onUploadStart: PropTypes.func.isRequired,
    onUploadDone: PropTypes.func.isRequired,
    onUploadError: PropTypes.func
  };

  componentDidMount() {
    const props = this.props;

    $(this.refs.uploader).fileupload({
      dataType: 'json',
      url: this.props.toUrl,
      // prevent fileupload from replacing the input DOM element, which
      // React does not like
      replaceFileInput: false,
      add: function (e, data) {
        // onUploadStart method must call data.submit()
        props.onUploadStart(data);
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
  }

  componentWillUnmount() {
    $(this.refs.uploader).fileupload('destroy');
  }

  openFileChooser = () => this.refs.uploader.click();

  render() {
    // NOTE: IE9 will ignore accept, which means on this browser we can end
    // up uploading files that don't match allowedExtensions; for this reason,
    // the server should also validate allowed file types.
    return (
      <input
        ref="uploader"
        className="uitest-hidden-uploader"
        type="file"
        style={{display: 'none'}}
        accept={(this.props.allowedExtensions || '*')}
      />
    );
  }
}

window.dashboard = window.dashboard || {};
window.dashboard.HiddenUploader = HiddenUploader;
