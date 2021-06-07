import PropTypes from 'prop-types';
import React, {Component} from 'react';
import Button from './Button';
import i18n from '@cdo/locale';
import BaseDialog from './BaseDialog';
import DialogFooter from './teacherDashboard/DialogFooter';
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';

export default class GDPRDialog extends Component {
  static propTypes = {
    isDialogOpen: PropTypes.bool.isRequired,
    currentUserId: PropTypes.number.isRequired,
    // If we're coming from pegasus, studioUrlPrefix is passed in as a prop and used to construct the logout url.
    studioUrlPrefix: PropTypes.string
  };

  state = {
    isDialogOpen: this.props.isDialogOpen
  };

  handleYesClick = () => {
    this.setState({isDialogOpen: false});
    $.post(`/dashboardapi/v1/users/accept_data_transfer_agreement`, {
      user_id: this.props.currentUserId
    });
  };

  render() {
    const {studioUrlPrefix} = this.props;
    const logOutUrl = studioUrlPrefix
      ? `${studioUrlPrefix}/users/sign_out`
      : '/users/sign_out';

    return (
      <BaseDialog
        useUpdatedStyles
        isOpen={this.state.isDialogOpen}
        style={styles.dialog}
        uncloseable
      >
        <h2 className="ui-test-gdpr-dialog">
          {i18n.gdprDialogHeaderUpdated()}
        </h2>
        <div>{i18n.gdprDialogDetailsUpdated()}</div>
        <div style={styles.instructions}>
          <a
            href={pegasus('/privacy')}
            className="ui-test-gdpr-dialog-privacy-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            {i18n.gdprDialogVisitPrivacyPolicy()}
          </a>
        </div>
        <DialogFooter>
          <Button
            __useDeprecatedTag
            text={i18n.gdprDialogLogout()}
            href={logOutUrl}
            color={Button.ButtonColor.gray}
            className="ui-test-gdpr-dialog-logout"
          />
          <Button
            __useDeprecatedTag
            text={i18n.gdprDialogYes()}
            onClick={this.handleYesClick}
            color={Button.ButtonColor.orange}
            className="ui-test-gdpr-dialog-accept"
          />
        </DialogFooter>
      </BaseDialog>
    );
  }
}

const styles = {
  dialog: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20
  },
  instructions: {
    marginTop: 20
  }
};
