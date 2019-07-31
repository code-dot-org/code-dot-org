/** @file Renders error dialogs in sequence, given a stack of errors */
import PropTypes from 'prop-types';
import React from 'react';
import * as actions from './errorDialogStackModule';
import {connect} from 'react-redux';
import BaseDialog from '@cdo/apps/templates/BaseDialog.jsx';
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';
var labMsg = require('@cdo/gamelab/locale') || require('@cdo/spritelab/locale');
import msg from '@cdo/locale';
import Button from '@cdo/apps/templates/Button';
import DialogFooter from '@cdo/apps/templates/teacherDashboard/DialogFooter';
import * as animationActions from './animationListModule';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import {getCurrentId} from '@cdo/apps/code-studio/initApp/project';

/**
 * Renders error dialogs in sequence, given a stack of errors.
 */
class ErrorDialogStack extends React.Component {
  static propTypes = {
    // From redux
    errors: PropTypes.arrayOf(PropTypes.object).isRequired,
    dismissError: PropTypes.func.isRequired,
    deleteAnimation: PropTypes.func,
    animationList: PropTypes.object
  };

  handleDeleteChoice(key) {
    // Log data about when this scenario occurs
    firehoseClient.putRecord(
      {
        study: 'animation_no_load',
        study_group: 'animation_no_load_v4',
        event: 'delete_selected',
        project_id: getCurrentId(),
        data_json: JSON.stringify({
          version: this.props.animationList.propsByKey[key].version,
          animationName: this.props.animationList.propsByKey[key].name
        })
      },
      {includeUserId: true}
    );
    this.props.deleteAnimation(key);
    this.props.dismissError();
  }

  handleReloadChoice(key) {
    // Log data about when this scenario occurs
    firehoseClient.putRecord(
      {
        study: 'animation_no_load',
        study_group: 'animation_no_load_v4',
        event: 'reload_selected',
        project_id: getCurrentId(),
        data_json: JSON.stringify({
          version: this.props.animationList.propsByKey[key].version,
          animationName: this.props.animationList.propsByKey[key].name
        })
      },
      {includeUserId: true}
    );
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
            <p>
              {labMsg.errorLoadingAnimation({animationName: animationName})}
            </p>
            <p>
              {msg.contactWithoutEmail()}{' '}
              <a href={pegasus('/contact')} target="_blank">
                https://code.org/contact
              </a>
              .
            </p>
            <DialogFooter>
              {error.error_cause && (
                <Button
                  text={msg.delete() + ' "' + animationName + '"'}
                  onClick={() => this.handleDeleteChoice(error.error_cause)}
                  color="red"
                />
              )}
              <Button
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
      animationList: state.animationList
    };
  },
  function propsFromDispatch(dispatch) {
    return {
      dismissError: function() {
        dispatch(actions.dismissError());
      },
      deleteAnimation: function(key) {
        dispatch(animationActions.deleteAnimation(key));
      }
    };
  }
)(ErrorDialogStack);

export const UnconnectedErrorDialogStack = ErrorDialogStack;
