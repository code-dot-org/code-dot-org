/** @file Renders error dialogs in sequence, given a stack of errors */
import Dialog from '@code-dot-org/component-library/dialog';
import Link from '@code-dot-org/component-library/link';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import {pegasus} from '@cdo/apps/lib/util/urlHelpers';
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

  handleReloadChoice = () => {
    location.reload();
  };

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

    if (error.error_type === 'anim_load') {
      return (
        <Dialog
          title={error.message}
          customContent={
            <div style={{textAlign: 'center'}}>
              <Typography
                variant="body3"
                component="p"
                id="dsco-dialog-description"
              >
                {msg.errorLoadingAnimation({animationName: animationName})}
              </Typography>
              <Typography variant="body3" component="p">
                {msg.contactWithoutEmail()}{' '}
                <Link href={pegasus('/contact')} openInNewTab external size="s">
                  https://code.org/contact
                </Link>
                .
              </Typography>
            </div>
          }
          primaryButtonProps={{
            children: msg.reloadPage(),
            onClick: this.handleReloadChoice,
          }}
          secondaryButtonProps={
            error.error_cause
              ? {
                  children: msg.delete() + ' "' + animationName + '"',
                  onClick: () => this.handleDeleteChoice(error.error_cause),
                  color: 'error',
                }
              : undefined
          }
        />
      );
    }

    return (
      <Dialog
        title="Error"
        customContent={
          <Typography
            variant="body3"
            component="p"
            id="dsco-dialog-description"
            style={{textAlign: 'center'}}
          >
            {error.message}
          </Typography>
        }
        onClose={this.props.dismissError}
        closeLabel={msg.dialogOK()}
        primaryButtonProps={{
          children: msg.dialogOK(),
          onClick: this.props.dismissError,
        }}
      />
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
