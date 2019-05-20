import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {SignInState} from '@cdo/apps/code-studio/progressRedux';
import ExportAllowedDialog from './ExportAllowedDialog';
import ShareDisallowedDialog from './ShareDisallowedDialog';

class ExportDialog extends Component {
  static propTypes = {
    signInState: PropTypes.oneOf(Object.values(SignInState)),
    isProjectLevel: PropTypes.bool.isRequired
  };

  render() {
    const {signInState, isProjectLevel, ...otherProps} = this.props;
    // If we're on a project level (i.e. /projects/appname), always show signed
    // in version of the dialog

    if (signInState === SignInState.SignedIn || isProjectLevel) {
      return <ExportAllowedDialog {...otherProps} />;
    }

    return <ShareDisallowedDialog />; // TODO: re-use or create ExportDisallowedDialog?
  }
}

export const UnconnectedExportDialog = ExportDialog;

export default connect(state => ({
  signInState: state.progress.signInState
}))(ExportDialog);
