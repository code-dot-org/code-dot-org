import React, {Component, PropTypes} from 'react';
import Button from './Button';
import i18n from "@cdo/locale";
import BaseDialog from './BaseDialog';
import DialogFooter from "./teacherDashboard/DialogFooter";

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
    isDialogOpen: PropTypes.bool,
  };

  state = {
    isDialogOpen: this.props.isDialogOpen,
  };

  render() {
    return (
      <div>
        <BaseDialog
          useUpdatedStyles
          isOpen
          style={styles.dialog}
          uncloseable
        >
          <h2>{i18n.gdprDialogHeader()}</h2>
          <div>
            {i18n.gdprDialogDetails()}
          </div>
          <div style={styles.instructions}>
            {i18n.gdprDialogLinkIntro() + " "}
            <a href="privacy-policy">
              {i18n.gdprDialogPrivacyPolicy()}.
            </a>
          </div>
          <DialogFooter>
            <Button
              text={i18n.gdprDialogLogout()}
              onClick={()=> console.log("clicked")}
              color={Button.ButtonColor.gray}
            />
            <Button
              text={i18n.gdprDialogYes()}
              onClick={()=> console.log("clicked")}
              color={Button.ButtonColor.orange}
            />
          </DialogFooter>
        </BaseDialog>
      </div>
    );
  }
}
//
// export const UnconnectedControlProjectSharingDialog = ControlProjectSharingDialog;
//
// export default connect(state => ({}), dispatch => ({
//   toggleSharingColumn() {
//     dispatch(toggleSharingColumn());
//   },
//   editAll() {
//     dispatch(editAll());
//   },
// }))(ControlProjectSharingDialog);
