import {Typography, Button as MuiButton} from '@mui/material';
import $ from 'jquery';
import React, {useState} from 'react';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import i18n from '@cdo/locale';

import styles from './styles.module.scss';

interface LtiDynamicRegistrationProps {
  logoUrl: string;
  registrationID: string;
  lmsName: string;
}

export const LtiDynamicRegistrationPage = ({
  logoUrl,
  registrationID,
  lmsName,
}: LtiDynamicRegistrationProps) => {
  const [submitDisable, setSubmitDisable] = useState<boolean>(false);
  const [email, setEmail] = useState('');
  const [hasError, setHasError] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitDisable(true);

    $.ajax({
      type: 'POST',
      url: '/lti/v1/dynamic_registration',
      data: {
        email: email,
        registration_id: registrationID,
      },
      dataType: 'json',
      success: () => {
        // Send post message to Canvas parent window
        // https://canvas.instructure.com/doc/api/file.registration.html#registration-response
        window.parent.postMessage({subject: 'org.imsglobal.lti.close'}, '*');
        analyticsReporter.sendEvent(EVENTS.LTI_DYNAMIC_REGISTRATION_COMPLETED, {
          lms_name: lmsName,
        });
      },
      error: xhr => {
        setHasError(true);
        setErrorMsg(JSON.parse(xhr.responseText).error);
      },
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  return (
    <main className={styles.mainContentContainer}>
      <div className={styles.mainContent}>
        <img className={styles.logo} src={logoUrl} alt={i18n.codeLogo()} />
        <Typography className={styles.description} variant="body1" gutterBottom>
          {hasError ? errorMsg : i18n.ltiDynamicRegistrationDescription()}
        </Typography>
        <div>
          <form onSubmit={handleSubmit}>
            <div className={styles.inputContainer}>
              <label className={styles.formLabel}>
                <strong>{i18n.email()}</strong>
                <input
                  className={styles.input}
                  type="email"
                  value={email}
                  onChange={handleChange}
                  required
                />
              </label>
            </div>
          </form>
        </div>
        <div>
          <MuiButton
            variant="contained"
            color="primary"
            size="large"
            disabled={submitDisable}
            className={styles.callToAction}
            onClick={handleSubmit}
            type="button"
          >
            {i18n.ltiDynamicRegistrationSubmit()}
          </MuiButton>
        </div>
      </div>
    </main>
  );
};

export default LtiDynamicRegistrationPage;
