import {Button as MuiButton, Typography as MuiTypography} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

import RailsAuthenticityToken from '../lib/util/RailsAuthenticityToken';

import styles from './expire-other-sessions.module.scss';

/**
 * "Manage Other Sessions" section of the account edit page. Submits a native
 * Rails DELETE form (with CSRF token) to expire the user's other sessions.
 * Heading/description/button text and the form action are passed in from the
 * server-rendered mount point so localization stays on the Rails side.
 */
export default function ExpireOtherSessions({
  expirePath,
  heading,
  description,
  buttonLabel,
}) {
  return (
    <div>
      <hr />
      <MuiTypography variant="h5" component="h2" gutterBottom>
        {heading}
      </MuiTypography>
      <MuiTypography variant="body2">{description}</MuiTypography>
      <form method="post" action={expirePath} className={styles.form}>
        <input type="hidden" name="_method" value="delete" />
        <RailsAuthenticityToken />
        <MuiButton
          type="submit"
          variant="contained"
          color="primary"
          size="small"
        >
          {buttonLabel}
        </MuiButton>
      </form>
    </div>
  );
}

ExpireOtherSessions.propTypes = {
  expirePath: PropTypes.string.isRequired,
  heading: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  buttonLabel: PropTypes.string.isRequired,
};
