/** @file Renders error dialogs in sequence, given a stack of errors */
import React, {PropTypes} from 'react';
import * as actions from './errorDialogStackModule';
import {connect} from 'react-redux';
import BaseDialog from '../templates/BaseDialog.jsx';
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';
import gamelabMsg from '@cdo/gamelab/locale';
import msg from '@cdo/locale';
import Button from '@cdo/apps/templates/Button';
import DialogFooter from '@cdo/apps/templates/teacherDashboard/DialogFooter';
import * as animationActions from './animationListModule';


/**
 * Renders error dialogs in sequence, given a stack of errors.
 */
class ErrorDialogStack extends React.Component {
  static propTypes = {
    //From redux
    errors: PropTypes.arrayOf(PropTypes.object).isRequired,
    dismissError: PropTypes.func.isRequired,
    deleteAnimation: PropTypes.func,
    animationList: PropTypes.object
  };

  handleDeleteChoice(key){
    this.props.deleteAnimation(key);
    this.props.dismissError();
  }

  render() {
    if (this.props.errors.length === 0) {
      return null;
    }

    const error = this.props.errors[0];
    const animationName =  (this.props.animationList.propsByKey[error.error_cause]) ?
      this.props.animationList.propsByKey[error.error_cause].name : "";

    return (
      <BaseDialog
        isOpen
        uncloseable={error.error_type==='anim_load'}
        hideCloseButton={error.error_type==='anim_load'}
        useDeprecatedGlobalStyles={error.error_type!=='anim_load'}
        handleClose={this.props.dismissError}
      >
        <h1>{error.message}</h1>
        {/* If this is the result of animation load failure, display additional
            information and choice to reload the page or delete the animation */}
        {error.error_type === 'anim_load' &&
          <div>
            <p>{gamelabMsg.errorLoadingAnimation({ animationName: animationName })}</p>
            <p>{msg.contactWithoutEmail()} <a href={pegasus('/contact')}>https://code.org/contact</a>.</p>
            <DialogFooter>
              {error.error_cause &&
                <Button
                  text={msg.delete() +  " \"" + animationName + "\""}
                  onClick={() => this.handleDeleteChoice(error.error_cause)}
                  color="red"
                />
              }
              <Button
                text={msg.reloadPage()}
                onClick={() => location.reload()}
              />
            </DialogFooter>
          </div>
        }
      </BaseDialog>
    );
  }
}
export default connect(
  function propsFromStore(state) {
    return {
      errors: state.errorDialogStack,
      animationList: state.animationList
    };
  },
  function propsFromDispatch(dispatch) {
    return {
      dismissError: function () {
        dispatch(actions.dismissError());
      },
      deleteAnimation: function (key) {
        dispatch(animationActions.deleteAnimation(key));
      }
    };
  }
)(ErrorDialogStack);
