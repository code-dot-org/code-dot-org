/** @file Renders error dialogs in sequence, given a stack of errors */
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import Button from '@cdo/apps/legacySharedComponents/Button';
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';
import BaseDialog from '@cdo/apps/templates/BaseDialog.jsx';
import DialogFooter from '@cdo/apps/templates/teacherDashboard/DialogFooter';
import msg from '@cdo/locale';

import * as animationActions from './redux/animationList';
import * as actions from './redux/errorDialogStack';

/**
 * Renders error dialogs in sequence, given a stack of errors.
 */
class ErrorDialogStack extends React.Component {
  static propTypes = {
    // From redux
    errors: PropTypes.arrayOf(PropTypes.object).isRequired,
    dismissError: PropTypes.func.isRequired,
    deleteAnimation: PropTypes.func,
    animationList: PropTypes.object,
    isSpriteLab: PropTypes.bool.isRequired,
  };

  handleDeleteChoice(key) {
    this.props.deleteAnimation(key, this.props.isSpriteLab);
    this.props.dismissError();
  }

  handleReloadChoice(key) {
    location.reload();
  }

  render() {
    if (this.props.errors.length === 0) {
      return null;
    }

    const error = this.props.errors[0];
    const animationName =
      this.props.animationList &&
      this.props.animationList.propsByKey[error.error_cause]
        ? this.props.animationList.propsByKey[error.error_cause].name
        : '';

    return (
      <BaseDialog
        isOpen
        uncloseable={error.error_type === 'anim_load'}
        hideCloseButton={error.error_type === 'anim_load'}
        handleClose={this.props.dismissError}
      >
        <h1>{error.message}</h1>
        {/* If this is the result of animation load failure, display additional
            information and choice to reload the page or delete the animation */}
        {error.error_type === 'anim_load' && (
          <div>
            <p>{msg.errorLoadingAnimation({animationName: animationName})}</p>
            <p>
              {msg.contactWithoutEmail()}{' '}
              <a
                href={pegasus('/contact')}
                target="_blank"
                rel="noopener noreferrer"
              >
                https://code.org/contact
              </a>
              .
            </p>
            <DialogFooter>
              {error.error_cause && (
                <Button
                  __useDeprecatedTag
                  text={msg.delete() + ' "' + animationName + '"'}
                  onClick={() => this.handleDeleteChoice(error.error_cause)}
                  color="red"
                />
              )}
              <Button
                __useDeprecatedTag
                text={msg.reloadPage()}
                onClick={() => this.handleReloadChoice(error.error_cause)}
              />
            </DialogFooter>
          </div>
        )}
      </BaseDialog>
    );
  }
}
export default connect(
  function propsFromStore(state) {
    return {
      errors: state.errorDialogStack,
      animationList: state.animationList,
      isSpriteLab: state.pageConstants.isBlockly,
    };
  },
  function propsFromDispatch(dispatch) {
    return {
      dismissError: function () {
        dispatch(actions.dismissError());
      },
      deleteAnimation: function (key, isSpriteLab) {
        dispatch(animationActions.deleteAnimation(key, isSpriteLab));
      },
    };
  }
)(ErrorDialogStack);

export const UnconnectedErrorDialogStack = ErrorDialogStack;
