import Alert from '@code-dot-org/component-library/alert';
import React, {useMemo} from 'react';

import currentLocale from '@cdo/apps/util/currentLocale';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import moduleStyles from './previousVersionAlert.module.scss';

// Renders the warning banner shown in a lab2 workspace when the user is
// viewing a previous version of their project loaded from version history.
// Self-gating: returns null unless lab2Project.viewingOldVersion is true.
const PreviousVersionAlert: React.FC = () => {
  const viewingOldVersion = useAppSelector(
    state => state.lab2Project.viewingOldVersion
  );
  const versionDetails = useAppSelector(
    state => state.lab2Project.versionDetails
  );

  const locale = currentLocale();
  const versionDate = useMemo(() => {
    if (!versionDetails?.lastModified) {
      return '';
    }
    const dateFormatter = new Intl.DateTimeFormat(locale, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });
    // Strip the space before AM/PM to keep the banner compact.
    return dateFormatter
      .format(new Date(versionDetails.lastModified))
      .replace(/\s(AM|PM)/gi, '$1');
  }, [versionDetails, locale]);

  if (!viewingOldVersion) {
    return null;
  }

  const text = versionDate ? (
    <>
      You're viewing a previous version of this project from{' '}
      <strong>{versionDate}</strong>.
    </>
  ) : (
    "You're viewing the initial version of this project."
  );

  return (
    <Alert
      className={moduleStyles.previousVersionBanner}
      text={text}
      type="warning"
      size="xs"
    />
  );
};

export default PreviousVersionAlert;
