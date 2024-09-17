import $ from 'jquery';
import React, {useState} from 'react';

import {Button} from '@cdo/apps/componentLibrary/button';
import Typography from '@cdo/apps/componentLibrary/typography';
import i18n from '@cdo/locale';

import styles from './styles.module.scss';

interface LtiDynamicRegistrationProps {
  logoUrl: string;
  registrationID: string;
}

export const LtiDynamicRegistrationPage = ({
  logoUrl,
  registrationID,
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
        <Typography
          semanticTag="p"
          visualAppearance="body-one"
          className={styles.description}
        >
          {hasError ? errorMsg : i18n.ltiDynamicRegistrationDescription()}
        </Typography>
        <div>
          <form>
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
          <Button
            disabled={submitDisable}
            className={styles.callToAction}
            onClick={handleSubmit}
            size="l"
            text={i18n.ltiDynamicRegistrationSubmit()}
          />
        </div>
      </div>
    </main>
  );
};

export default LtiDynamicRegistrationPage;
