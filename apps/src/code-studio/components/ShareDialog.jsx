import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { SignInState } from '@cdo/apps/code-studio/progressRedux';
import ShareDialogSignedIn from './ShareDialogSignedIn';
import ShareDialogSignedOut from './ShareDialogSignedOut';

class ShareDialog extends Component {
  static propTypes = {
    signInState: PropTypes.oneOf(Object.values(SignInState))
  };

  render() {
    const { signInState, ...otherProps } = this.props;
    if (signInState === SignInState.SignedIn) {
      return (
        <ShareDialogSignedIn {...otherProps}/>
      );
    }

    return <ShareDialogSignedOut/>;
  }
}

export const UnconnectedShareDialog = ShareDialog;

export default connect(state => ({
  signInState: state.progress.signInState,
}))(ShareDialog);
