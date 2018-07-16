import React, {PropTypes} from 'react';
import i18n from '@cdo/locale';
import color from '@cdo/apps/util/color';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import {Header, ConfirmCancelFooter} from '../SystemDialog/SystemDialog';
import Button from '@cdo/apps/templates/Button';
import {ADD_A_PERSONAL_LOGIN_HELP_URL} from '@cdo/apps/lib/util/urlHelpers';

const GUTTER = 20;
const styles = {
  container: {
    margin: GUTTER,
    color: color.charcoal,
  },
  dangerText: {
    color: color.red,
  },
  button: {
    display: 'block',
    textAlign: 'center',
    marginBottom: '1em',
  }
};

export default class PersonalLoginDialog extends React.Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onCancel: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
  };

  render() {
    const {isOpen, onCancel, onConfirm} = this.props;

    return (
      <BaseDialog
        useUpdatedStyles
        fixedWidth={550}
        isOpen={isOpen}
        handleClose={onCancel}
      >
        <div style={styles.container}>
          <Header text={i18n.deleteAccountDialog_header()}/>
          <p>
            <strong style={styles.dangerText}>{i18n.personalLoginDialog_body1()}</strong>
            {i18n.personalLoginDialog_body2()}
          </p>
          <p>
            {i18n.personalLoginDialog_body3()}
            <strong>{i18n.personalLoginDialog_body4()}</strong>
            {i18n.personalLoginDialog_body5()}
          </p>
          <Button
            text={i18n.removeStudentSendHomeInstructions()}
            target="_blank"
            href={ADD_A_PERSONAL_LOGIN_HELP_URL}
            color={Button.ButtonColor.blue}
            size={Button.ButtonSize.large}
            style={styles.button}
            tabIndex="1"
          />
          <p>
            {i18n.personalLoginDialog_body6()}
          </p>
          <ConfirmCancelFooter
            confirmText={i18n.personalLoginDialog_button()}
            onConfirm={onConfirm}
            onCancel={onCancel}
            tabIndex="1"
          />
        </div>
      </BaseDialog>
    );
  }
}
