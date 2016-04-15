var _ = require('../../lodash');
var AnimationPickerBody = require('./AnimationPickerBody.jsx');
var Dialog = require('../../templates/DialogComponent.jsx');
var HiddenUploader = require('../../assetManagement/HiddenUploader.jsx');
var styles = require('./styles');
var utils = require('../../utils');

/** @enum {string} */
var View = {
  PICKER: 'PICKER',
  UPLOAD_IN_PROGRESS: 'UPLOAD_IN_PROGRESS',
  ERROR: 'ERROR'
};

var AnimationPicker = React.createClass({
  propTypes: {
    channelId: React.PropTypes.string.isRequired,
    onComplete: React.PropTypes.func.isRequired,
    onCancel: React.PropTypes.func.isRequired,
    typeFilter: React.PropTypes.string
  },

  getInitialState: function () {
    return {view: View.PICKER};
  },

  onUploadClick: function () {
    this.refs.uploader.openFileChooser();
  },

  onUploadStart: function (data) {
    this.setState({
      view: View.UPLOAD_IN_PROGRESS,
      originalFileName: data.files[0].name
    });
  },

  onUploadDone: function (result) {
    this.props.onComplete(_.assign(result, {
      originalFileName: this.state.originalFileName
    }));
  },

  onUploadError: function (status) {
    console.log(status);
    this.setState({view: View.PICKER});
  },

  render: function () {
    var visibleBody;
    if (this.state.view === View.PICKER) {
      visibleBody = <AnimationPickerBody onUploadClick={this.onUploadClick} />;
    } else if (this.state.view === View.UPLOAD_IN_PROGRESS) {
      visibleBody = <h1 style={styles.title}>Uploading...</h1>;
    } else if (this.state.view === View.ERROR) {
      visibleBody = <h1>Error!</h1>;
    }

    return (
      <Dialog
          isOpen
          handleClose={this.props.onCancel}
          uncloseable={this.state.view === View.UPLOAD_IN_PROGRESS}>
        <HiddenUploader
            ref="uploader"
            toUrl={'/v3/animations/' + this.props.channelId + '/' + utils.createUuid() + '.png'}
            typeFilter={this.props.typeFilter}
            onUploadStart={this.onUploadStart}
            onUploadDone={this.onUploadDone}
            onUploadError={this.onUploadError} />
        {visibleBody}
      </Dialog>
    );
  }
});
module.exports = AnimationPicker;
