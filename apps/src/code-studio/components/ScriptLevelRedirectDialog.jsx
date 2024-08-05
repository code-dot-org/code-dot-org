import PropTypes from 'prop-types';
import React from 'react';

import RedirectDialog from '@cdo/apps/code-studio/components/RedirectDialog';
import {
  onDismissRedirectDialog,
  dismissedRedirectDialog,
} from '@cdo/apps/util/dismissVersionRedirect';
import i18n from '@cdo/locale';

export default class ScriptLevelRedirectDialog extends React.Component {
  static propTypes = {
    redirectUrl: PropTypes.string.isRequired,
    scriptName: PropTypes.string.isRequired,
    courseName: PropTypes.string,
  };

  state = {
    isOpen: true,
  };

  onCloseRedirectDialog = () => {
    const {courseName, scriptName} = this.props;
    // Use course name if available, and script name if not.
    onDismissRedirectDialog(courseName || scriptName);
    this.setState({
      isOpen: false,
    });
  };

  render() {
    const {redirectUrl, courseName, scriptName} = this.props;

    // Only render redirect dialog if isOpen and user hasn't already dismissed the dialog for this course or script.
    const displayRedirectDialog =
      this.state.isOpen && !dismissedRedirectDialog(courseName || scriptName);

    return (
      <RedirectDialog
        isOpen={displayRedirectDialog}
        details={i18n.assignedToNewerVersion()}
        handleClose={this.onCloseRedirectDialog}
        redirectUrl={redirectUrl}
        redirectButtonText={i18n.goToAssignedVersion()}
      />
    );
  }
}
