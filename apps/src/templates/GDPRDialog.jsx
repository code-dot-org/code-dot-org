import React, {Component, PropTypes} from 'react';
import Button from './Button';
import i18n from "@cdo/locale";
import BaseDialog from './BaseDialog';
import DialogFooter from "./teacherDashboard/DialogFooter";
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';

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

export default class GDPRDialog extends Component {
  static propTypes = {
    isDialogOpen: PropTypes.bool.isRequired,
    currentUserId: PropTypes.number.isRequired,
    // If we're coming from pegasus, studioUrlPrefix is passed in as a prop and used to construct the logout url.
    studioUrlPrefix: PropTypes.string
  };

  state = {
    isDialogOpen: this.props.isDialogOpen,
  };

  handleYesClick = () => {
    this.setState({isDialogOpen: false});
    $.post(
      `/api/v1/users/accept_data_transfer_agreement`, {user_id: this.props.currentUserId}
    );
  };

  render() {
    const {studioUrlPrefix} = this.props;
    const logOutUrl = studioUrlPrefix ?
      `http:${studioUrlPrefix}/users/sign_out` : "/users/sign_out";

    return (
      <div>
        <BaseDialog
          useUpdatedStyles
          isOpen={this.state.isDialogOpen}
          style={styles.dialog}
          uncloseable
        >
          <h2>{i18n.gdprDialogHeader()}</h2>
          <div>
            {i18n.gdprDialogDetails()}
          </div>
          <div style={styles.instructions}>
            {i18n.gdprDialogLinkIntro() + " "}
            <a href={pegasus('/privacy')}>
              {i18n.gdprDialogPrivacyPolicy()}.
            </a>
          </div>
          <DialogFooter>
            <Button
              text={i18n.gdprDialogLogout()}
              href={logOutUrl}
              color={Button.ButtonColor.gray}
            />
            <Button
              text={i18n.gdprDialogYes()}
              onClick={this.handleYesClick}
              color={Button.ButtonColor.orange}
            />
          </DialogFooter>
        </BaseDialog>
      </div>
    );
  }
}
