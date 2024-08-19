import $ from 'jquery';
import React, {CSSProperties, useState} from 'react';

import Button from '@cdo/apps/legacySharedComponents/Button';
import {LtiUpgradeAccountDialogProps} from '@cdo/apps/lib/ui/simpleSignUp/lti/upgrade/types';
import Spinner from '@cdo/apps/sharedComponents/Spinner';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import DialogFooter from '@cdo/apps/templates/teacherDashboard/DialogFooter';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';

export const LtiUpgradeAccountDialog = ({
  formData,
  onClose,
}: LtiUpgradeAccountDialogProps) => {
  const [emailAddress, setEmailAddress] = useState<string | undefined>(
    formData.email
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const handleClose = () => {
    setIsLoading(true);

    if (typeof onClose === 'function') {
      onClose();
    }
  };

  const isFormValid = () => {
    return !!emailAddress;
  };

  const handleEmailAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailAddress(e.target.value);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);

    $.ajax({
      type: 'POST',
      url: '/lti/v1/upgrade_account',
      data: {
        email: emailAddress,
      },
      dataType: 'json',
      success: function () {
        if (typeof onClose === 'function') {
          onClose();
        }
      },
    });
  };

  const spinnerView = () => {
    return (
      <div style={styles.spinnerContainer}>
        <p>
          <Spinner size={'large'} />
        </p>
        <p>{i18n.loading()}</p>
      </div>
    );
  };

  const getDialogBody = () => {
    if (isLoading) {
      return spinnerView();
    }

    return (
      <div data-testid="lti-upgrade-account">
        <h2 style={styles.dialogHeader}>
          {i18n.ltiUpgradeAccountDialogTitle()}
        </h2>
        <p>{i18n.ltiUpgradeAccountDialogDescription()}</p>

        <form>
          <div>
            <label>
              <strong style={styles.formLabel}>{i18n.email()}</strong>
              <input
                type={'text'}
                value={emailAddress}
                onChange={handleEmailAddressChange}
              />
            </label>
            {!isValid && (
              <p style={styles.error}>
                {i18n.ltiUpgradeAccountDialogInvalidEmail()}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              text={i18n.cancel()}
              onClick={handleClose}
              color={Button.ButtonColor.brandSecondaryDefault}
            />
            <Button
              text={i18n.continue()}
              disabled={!isValid}
              onClick={handleFormSubmit}
            />
          </DialogFooter>
        </form>
      </div>
    );
  };

  const isValid = isFormValid();

  return (
    <BaseDialog
      useUpdatedStyles
      isOpen={true}
      handleClose={handleClose}
      style={styles.dialog}
    >
      {getDialogBody()}
    </BaseDialog>
  );
};

const styles: {[styleKey: string]: CSSProperties} = {
  dialog: {
    padding: 20,
  },
  dialogHeader: {
    marginTop: 0,
  },
  error: {
    color: color.red,
  },
  formLabel: {
    padding: 8,
  },
  spinnerContainer: {
    textAlign: 'center',
  },
  spinner: {
    fontSize: '32px',
  },
};

export default LtiUpgradeAccountDialog;
