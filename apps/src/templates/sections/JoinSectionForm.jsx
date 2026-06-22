import Alert from '@code-dot-org/component-library/alert';
import TextField from '@code-dot-org/component-library/textField';
import {Typography as MuiTypography, Button as MuiButton} from '@mui/material';
import PropTypes from 'prop-types';
import React, {useState, useEffect} from 'react';

import styles from './join-section-form.module.scss';

// recaptcha v2 invokes this global callback (by name) when the user solves it.
const RECAPTCHA_CALLBACK = 'onJoinSectionCaptcha';

/**
 * Design-system version of the student "join a section" form (/join). Renders a
 * native POST form (preserving the Rails CSRF + server-side validation/redirect
 * flow) built from DSCO components. The translated copy, CSRF token, and
 * recaptcha config are supplied by the server.
 */
export default function JoinSectionForm({
  submitPath,
  authenticityToken,
  sectionCode,
  title,
  instructions,
  placeholder,
  submitLabel,
  inlineAlert,
  displayCaptcha,
  recaptchaSiteKey,
}) {
  const [code, setCode] = useState(sectionCode || '');
  // When a captcha is required the submit stays disabled until it's solved.
  const [captchaSolved, setCaptchaSolved] = useState(!displayCaptcha);

  useEffect(() => {
    if (!displayCaptcha) {
      return undefined;
    }
    window[RECAPTCHA_CALLBACK] = () => setCaptchaSolved(true);
    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
    return () => {
      delete window[RECAPTCHA_CALLBACK];
      document.body.removeChild(script);
    };
  }, [displayCaptcha]);

  return (
    <div className={styles.container}>
      <MuiTypography variant="h2" gutterBottom>
        {title}
      </MuiTypography>
      <MuiTypography variant="body2" gutterBottom>
        {instructions}
      </MuiTypography>
      <form action={submitPath} method="post" className={styles.form}>
        <input
          type="hidden"
          name="authenticity_token"
          value={authenticityToken}
        />
        <TextField
          name="section_code"
          value={code}
          onChange={e => setCode(e.target.value)}
          placeholder={placeholder}
          className={styles.field}
        />
        {displayCaptcha && (
          <div
            className="g-recaptcha"
            data-sitekey={recaptchaSiteKey}
            data-callback={RECAPTCHA_CALLBACK}
          />
        )}
        <MuiButton
          type="submit"
          id="join_new_section"
          variant="contained"
          color="primary"
          disabled={!captchaSolved}
        >
          {submitLabel}
        </MuiButton>
        {inlineAlert && (
          <Alert
            type="danger"
            size="s"
            text={inlineAlert}
            className={styles.alert}
          />
        )}
      </form>
    </div>
  );
}

JoinSectionForm.propTypes = {
  submitPath: PropTypes.string.isRequired,
  authenticityToken: PropTypes.string.isRequired,
  sectionCode: PropTypes.string,
  title: PropTypes.string.isRequired,
  instructions: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired,
  submitLabel: PropTypes.string.isRequired,
  inlineAlert: PropTypes.string,
  displayCaptcha: PropTypes.bool,
  recaptchaSiteKey: PropTypes.string,
};
