import Modal from '@code-dot-org/component-library/modal';
import {Button as MuiButton, Typography as MuiTypography} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

import {ADD_A_PERSONAL_LOGIN_HELP_URL} from '@cdo/apps/lib/util/urlHelpers';
import GlobalEditionWrapper from '@cdo/apps/templates/GlobalEditionWrapper';
import i18n from '@cdo/locale';

import styles from './personal-login-dialog.module.scss';

export class PersonalLoginDialog extends React.Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    dependentStudentsCount: PropTypes.number.isRequired,
    onCancel: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    hideInstructions: PropTypes.bool,
  };

  render() {
    const {
      isOpen,
      dependentStudentsCount,
      onCancel,
      onConfirm,
      hideInstructions,
    } = this.props;

    if (!isOpen) {
      return null;
    }

    return (
      <Modal
        title={i18n.deleteAccountDialog_header()}
        onClose={onCancel}
        closeLabel={i18n.closeDialog()}
        customContent={
          <div className={styles.container}>
            <MuiTypography variant="body2" component="p">
              <strong className={styles.dangerText}>
                {i18n.personalLoginDialog_body1({
                  numStudents: dependentStudentsCount,
                })}
                {i18n.personalLoginDialog_body2({
                  numStudents: dependentStudentsCount,
                })}
              </strong>
            </MuiTypography>
            {!hideInstructions && (
              <>
                <MuiTypography variant="body2" component="p">
                  {i18n.personalLoginDialog_body3()}
                  <strong>{i18n.personalLoginDialog_body4()}</strong>
                  {i18n.personalLoginDialog_body5()}
                </MuiTypography>
                <MuiButton
                  href={ADD_A_PERSONAL_LOGIN_HELP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="contained"
                  color="primary"
                  size="small"
                  className={styles.button}
                >
                  {i18n.removeStudentSendHomeInstructions()}
                </MuiButton>
                <MuiTypography variant="body2" component="p">
                  {i18n.personalLoginDialog_body6()}
                </MuiTypography>
              </>
            )}
          </div>
        }
        primaryButtonProps={{
          children: i18n.personalLoginDialog_button(),
          onClick: onConfirm,
        }}
        secondaryButtonProps={{
          children: i18n.cancel(),
          onClick: onCancel,
        }}
      />
    );
  }
}

const RegionalPersonalLoginDialog = props => (
  <GlobalEditionWrapper
    component={PersonalLoginDialog}
    componentId="PersonalLoginDialog"
    props={props}
  />
);

export default RegionalPersonalLoginDialog;
