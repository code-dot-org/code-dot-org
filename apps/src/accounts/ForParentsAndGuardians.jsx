import Link from '@code-dot-org/component-library/link';
import {Typography as MuiTypography} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

import commonStyles from './common/common.styles.module.scss';

/**
 * "For Parents and Guardians" section of the account edit page (students only).
 *
 * The Update/Remove links keep their original DOM ids so the existing
 * AddParentEmailController / RemoveParentEmailController attach to them
 * unchanged (this component must be mounted before those controllers are
 * constructed). The #displayed-parent-email span is likewise updated by the
 * controller on success. Text is passed in from the server-rendered mount
 * point so localization stays Rails-side.
 */
export default function ForParentsAndGuardians({
  heading,
  intro,
  emailLabel,
  currentEmail,
  updateLabel,
  hasParentEmail,
  orLabel,
  removeLabel,
  note,
}) {
  return (
    <div>
      <hr className={commonStyles.sectionDivider} />
      <MuiTypography
        className={commonStyles.sectionHeader}
        component="h2"
        variant="h5"
        gutterBottom
      >
        {heading}
      </MuiTypography>
      <MuiTypography variant="body2">{intro}</MuiTypography>
      <MuiTypography variant="body2">
        <strong>{emailLabel}:</strong>{' '}
        <span id="displayed-parent-email">{currentEmail}</span> ({' '}
        <Link id="add-parent-email-link" href="#">
          {updateLabel}
        </Link>
        {hasParentEmail && (
          <>
            {' '}
            {orLabel}{' '}
            <Link id="remove-parent-email-link" href="#">
              {removeLabel}
            </Link>
          </>
        )}{' '}
        )
      </MuiTypography>
      <MuiTypography variant="body2">{note}</MuiTypography>
    </div>
  );
}

ForParentsAndGuardians.propTypes = {
  heading: PropTypes.string.isRequired,
  intro: PropTypes.string.isRequired,
  emailLabel: PropTypes.string.isRequired,
  currentEmail: PropTypes.string.isRequired,
  updateLabel: PropTypes.string.isRequired,
  hasParentEmail: PropTypes.bool,
  orLabel: PropTypes.string.isRequired,
  removeLabel: PropTypes.string.isRequired,
  note: PropTypes.string.isRequired,
};
