import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import Link from '@code-dot-org/component-library/link';
import {Typography as MuiTypography} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './account-edit-header.module.scss';

/**
 * Design-system header for the account settings page (/users/edit): a back link
 * and the page title, replacing the legacy HAML back anchor + `h1.text-black`.
 */
export default function AccountEditHeader({title, backLabel}) {
  return (
    <div className={styles.header}>
      <Link
        href="#"
        size="s"
        className={styles.backLink}
        onClick={e => {
          e.preventDefault();
          window.history.back();
        }}
      >
        <FontAwesomeV6Icon iconName="chevron-left" iconStyle="solid" />
        {backLabel}
      </Link>
      <MuiTypography variant="h2" component="h1">
        {title}
      </MuiTypography>
    </div>
  );
}

AccountEditHeader.propTypes = {
  title: PropTypes.string.isRequired,
  backLabel: PropTypes.string.isRequired,
};
