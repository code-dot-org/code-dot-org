var AnimationPickerBody = require('./AnimationPickerBody.jsx');
var Dialog = require('../../templates/DialogComponent.jsx');
var HiddenUploader = require('../../assetManagement/HiddenUploader.jsx');
var styles = require('./styles');

/** @enum {string} */
var View = {
  PICKER: 'PICKER',
  UPLOAD_IN_PROGRESS: 'UPLOAD_IN_PROGRESS',
  ERROR: 'ERROR'
};

var AnimationPicker = React.createClass({
  propTypes: {
    channelId: React.PropTypes.string.isRequired,
    handleClose: React.PropTypes.func.isRequired,
    typeFilter: React.PropTypes.string
  },

  getInitialState: function () {
    return {view: View.PICKER};
  },

  onUploadClick: function () {
    this.refs.uploader.openFileChooser();
  },

  onUploadStart: function () {
    console.log('onUploadStart');
    this.setState({view: View.UPLOAD_IN_PROGRESS});
  },

  onUploadDone: function (result) {
    console.log('onUploadDone');
    console.log(result);
    this.setState({view: View.PICKER});
  },

  onUploadError: function (status) {
    console.log('onUploadError');
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
          handleClose={this.props.handleClose}
          uncloseable={this.state.view === View.UPLOAD_IN_PROGRESS}>
        <HiddenUploader
            ref="uploader"
            toUrl={'/v3/animations/' + this.props.channelId + '/new_animations.png'}
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
