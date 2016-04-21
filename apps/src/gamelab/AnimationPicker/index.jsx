var _ = require('../../lodash');
var AnimationPickerBody = require('./AnimationPickerBody.jsx');
var connect = require('react-redux').connect;
var Dialog = require('../../templates/DialogComponent.jsx');
var gamelabActions = require('../actions');
var gamelabMsg = require('../locale');
var HiddenUploader = require('../../assetManagement/HiddenUploader.jsx');
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
module.exports = AnimationPicker;

/**
 * Connected AnimationPicker for GameLab use.  Assumes AnimationPicker.reducer
 * has been combined as part of the root reducer.
 */
AnimationPicker.ConnectedAnimationPicker = connect(function propsFromStore(state) {
  return {
    visible: state.animationPicker.visible,
    uploadInProgress: state.animationPicker.uploadInProgress,
    uploadError: state.animationPicker.uploadError
  };
}, function propsFromDispatch(dispatch) {
  return {
    onClose: function () {
      dispatch(AnimationPicker.actions.hide());
    },
    onUploadStart: function (data) {
      dispatch(AnimationPicker.actions.beginUpload(data.files[0].name));
    },
    onUploadDone: function (result) {
      dispatch(AnimationPicker.actions.handleUploadComplete(result));
    },
    onUploadError: function (status) {
      dispatch(AnimationPicker.actions.handleUploadError(status));
    }
  };
})(AnimationPicker);

/**
 * @enum {string} Export possible targets for animation picker for consumers
 *       to use when calling show().
 */
var Goal = AnimationPicker.Goal = utils.makeEnum('NEW_ANIMATION', 'NEW_FRAME');

//
// Reducer and Actions
//
AnimationPicker.actions = {};
var SHOW = 'AnimationPicker/SHOW';
var HIDE = 'AnimationPicker/HIDE';
var BEGIN_UPLOAD = 'AnimationPicker/BEGIN_UPLOAD';
var HANDLE_UPLOAD_ERROR = 'AnimationPicker/HANDLE_UPLOAD_ERROR';

// Default state, which we reset to any time we hide the animation picker.
var initialState = {
  visible: false,
  goal: null,
  uploadInProgress: false,
  uploadFilename: null,
  uploadError: null
};

AnimationPicker.reducer = function (state, action) {
  state = state || initialState;
  switch (action.type) {
    case SHOW:
      if (!state.visible) {
        return _.assign({}, initialState, {
          visible: true,
          goal: action.goal
        });
      }
      return state;
    
    case HIDE:
      return initialState;

    case BEGIN_UPLOAD:
      return _.assign({}, state, {
        uploadInProgress: true,
        uploadFilename: action.filename
      });

    case HANDLE_UPLOAD_ERROR:
      return _.assign({}, state, {
        uploadInProgress: false,
        uploadError: action.status
      });

    default:
      return state;
  }
};

/**
 * Display the AnimationPicker modal dialog (reset to initial state).
 * @param {!AnimationPicker.Goal} goal - whether we intend to turn the selected
 *        asset(s) into a new animation or new frames in an existing animation.
 * @returns {{type: string, goal: AnimationPicker.Goal }}
 * @throws {TypeError} if a valid goal is not provided
 */
AnimationPicker.actions.show = function (goal) {
  if ([Goal.NEW_ANIMATION, Goal.NEW_FRAME].indexOf(goal) === -1) {
    throw new TypeError('Must provide a valid goal');
  }
  return { type: SHOW, goal: goal };
};

/**
 * Hide the AnimationPicker modal dialog (resetting its state).
 * @returns {{type: string}}
 */
AnimationPicker.actions.hide = function () {
  return { type: HIDE };
};

/**
 * We have an upload in progress.  Record the name of the file being uploaded.
 * @param {!string} filename
 * @returns {{type: string, filename: string}}
 */
AnimationPicker.actions.beginUpload = function (filename) {
  return {
    type: BEGIN_UPLOAD,
    filename: filename
  };
};

/**
 * An upload completed successfully.  This concludes our picking process.
 * Dispatch a root gamelab action to add appropriate metadata and then close
 * the animation picker.
 * @param {!{filename: string, result: number, versionId: string}} result
 * @returns {function}
 */
AnimationPicker.actions.handleUploadComplete = function (result) {
  return function (dispatch, getState) {
    var state = getState().animationPicker;
    var goal = state.goal;
    var uploadFilename = state.uploadFilename;
    if (goal === Goal.NEW_ANIMATION) {
      dispatch(gamelabActions.addAnimation({
        key: result.filename.replace(/\.png$/i, ''),
        name: uploadFilename,
        size: result.size,
        version: result.versionId
      }));
    } else if (goal === Goal.NEW_FRAME) {
      // TODO (bbuchanan): Implement after integrating Piskel
    }
    dispatch(AnimationPicker.actions.hide());
  };
};

/**
 * An upload error occurred.  Show it to the student.
 * @param {!string} status
 * @returns {{type: string, status: string}}
 */
AnimationPicker.actions.handleUploadError = function (status) {
  return {
    type: HANDLE_UPLOAD_ERROR,
    status: status
  };
};
