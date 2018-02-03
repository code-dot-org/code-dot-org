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

  render() {
    if (this.props.errors.length === 0) {
      return null;
    }

    return (
      <BaseDialog
        isOpen
        hideCloseButton
        useDeprecatedGlobalStyles={this.props.errors[0].error_type !== "anim_load"}
        handleClose={this.props.dismissError}
      >
        <h1>{this.props.errors[0].message}</h1>
        {this.props.errors[0].error_type === 'anim_load' &&
          <div>
            <p>{gamelabMsg.errorLoadingAnimation({ animationName: this.props.animationList.propsByKey[this.props.errors[0].error_cause].name })}</p>
            <p>{msg.contactWithoutEmail()} <a href={pegasus('/contact')}>https://code.org/contact</a>.</p>
            <DialogFooter>
              {this.props.errors[0].error_cause &&
                <Button
                  text={msg.delete() +  " \"" + this.props.animationList.propsByKey[this.props.errors[0].error_cause].name + "\""}
                  onClick={() => this.props.deleteAnimation(this.props.errors[0].error_cause)}
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
      }
    };
  }
)(ErrorDialogStack);
