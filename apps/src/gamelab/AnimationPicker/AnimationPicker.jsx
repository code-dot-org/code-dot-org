var actions = require('./animationPickerModule');
var AnimationPickerBody = require('./AnimationPickerBody.jsx');
var connect = require('react-redux').connect;
var Dialog = require('../../templates/DialogComponent.jsx');
var gamelabMsg = require('../locale');
var HiddenUploader = window.dashboard.HiddenUploader;
var styles = require('./styles');
var utils = require('../../utils');

/**
 * Dialog used for finding/selecting/uploading one or more assets to add to a
 * GameLab project.
 *
 * When opened, the picker can have one of two goals:
 *   NEW_ANIMATION - the picked assets become new animations in the project.
 *   NEW_FRAME - the picked assets become new frames in an existing animation.
 *
 * It's possible for the picker to be dismissed without selecting anything,
 * or it gets dismissed when a final selection is confirmed.
 *
 * As a dialog-type redux-friendly component, the AnimationPicker handles its
 * own display state and can be "rendered" at all times by its parent.
 */
var AnimationPicker = React.createClass({
  propTypes: {
    // Provided externally
    channelId: React.PropTypes.string.isRequired,
    typeFilter: React.PropTypes.string,

    // Provided via Redux
    visible: React.PropTypes.bool.isRequired,
    uploadInProgress: React.PropTypes.bool.isRequired,
    uploadError: React.PropTypes.string,
    onClose: React.PropTypes.func.isRequired,
    onUploadStart: React.PropTypes.func.isRequired,
    onUploadDone: React.PropTypes.func.isRequired,
    onUploadError: React.PropTypes.func.isRequired
  },

  onUploadClick: function () {
    this.refs.uploader.openFileChooser();
  },

  renderVisibleBody: function () {
    if (this.props.uploadError) {
      return <h1>{gamelabMsg.animationPicker_error({ message: this.props.uploadError })}</h1>;
    } else if (this.props.uploadInProgress) {
      return <h1 style={styles.title}>{gamelabMsg.animationPicker_uploading()}</h1>;
    }
    return <AnimationPickerBody onUploadClick={this.onUploadClick} />;
  },

  render: function () {
    if (!this.props.visible) {
      return null;
    }

    return (
      <Dialog
          isOpen
          handleClose={this.props.onClose}
          uncloseable={this.props.uploadInProgress}>
        <HiddenUploader
            ref="uploader"
            toUrl={'/v3/animations/' + this.props.channelId + '/' + utils.createUuid() + '.png'}
            typeFilter={this.props.typeFilter}
            onUploadStart={this.props.onUploadStart}
            onUploadDone={this.props.onUploadDone}
            onUploadError={this.props.onUploadError} />
        {this.renderVisibleBody()}
      </Dialog>
    );
  }
});
module.exports = connect(function propsFromStore(state) {
  return {
    visible: state.animationPicker.visible,
    uploadInProgress: state.animationPicker.uploadInProgress,
    uploadError: state.animationPicker.uploadError
  };
}, function propsFromDispatch(dispatch) {
  return {
    onClose: function () {
      dispatch(actions.hide());
    },
    onUploadStart: function (data) {
      dispatch(actions.beginUpload(data.files[0].name));
    },
    onUploadDone: function (result) {
      dispatch(actions.handleUploadComplete(result));
    },
    onUploadError: function (status) {
      dispatch(actions.handleUploadError(status));
    }
  };
})(AnimationPicker);
