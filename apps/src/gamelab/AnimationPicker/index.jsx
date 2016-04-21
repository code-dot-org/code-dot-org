var _ = require('../../lodash');
var actions = require('./actions');
var AnimationPickerBody = require('./AnimationPickerBody.jsx');
var connect = require('react-redux').connect;
var Dialog = require('../../templates/DialogComponent.jsx');
var HiddenUploader = require('../../assetManagement/HiddenUploader.jsx');
var styles = require('./styles');
var utils = require('../../utils');
var View = require('./actions').View;

var AnimationPicker = React.createClass({
  propTypes: {
    channelId: React.PropTypes.string.isRequired,
    typeFilter: React.PropTypes.string,
    currentView: React.PropTypes.string.isRequired,
    originalFileName: React.PropTypes.string,
    status: React.PropTypes.string,
    onComplete: React.PropTypes.func.isRequired,
    onCancel: React.PropTypes.func.isRequired,
    onUploadStart: React.PropTypes.func.isRequired,
    onUploadError: React.PropTypes.func.isRequired
  },

  onUploadClick: function () {
    this.refs.uploader.openFileChooser();
  },

  onUploadDone: function (result) {
    this.props.onComplete(_.assign(result, {
      originalFileName: this.props.originalFileName
    }));
  },

  renderVisibleBody: function () {
    var visibleBody;
    if (this.props.currentView === View.PICKER) {
      return <AnimationPickerBody onUploadClick={this.onUploadClick} />;
    } else if (this.props.currentView === View.UPLOAD_IN_PROGRESS) {
      return <h1 style={styles.title}>Uploading...</h1>;
    } else if (this.props.currentView === View.ERROR) {
      return <h1>Error: {this.props.status}</h1>;
    }
  },

  render: function () {
    return (
      <Dialog
          isOpen
          handleClose={this.props.onCancel}
          uncloseable={this.props.currentView === View.UPLOAD_IN_PROGRESS}>
        <HiddenUploader
            ref="uploader"
            toUrl={'/v3/animations/' + this.props.channelId + '/' + utils.createUuid() + '.png'}
            typeFilter={this.props.typeFilter}
            onUploadStart={this.props.onUploadStart}
            onUploadDone={this.onUploadDone}
            onUploadError={this.props.onUploadError} />
        {this.renderVisibleBody()}
      </Dialog>
    );
  }
});
module.exports = connect(function propsFromStore(state) {
  return {
    currentView: state.animationTab.animationPicker.currentView,
    originalFileName: state.animationTab.animationPicker.originalFileName,
    status: state.animationTab.animationPicker.status
  };
}, function propsFromDispatch(dispatch) {
  return {
    onUploadStart: function (data) {
      dispatch(actions.beginUpload(data.files[0].name));
    },
    onUploadError: function (status) {
      dispatch(actions.displayError(status));
    }
  };
})(AnimationPicker);
