import Alert from '@code-dot-org/component-library/alert';
import React, {useState} from 'react';

import {WARNING_BANNER_MESSAGES} from '@cdo/apps/lab2/constants';

import moduleStyles from './pack-removed-alert.module.scss';

// Dismissing hides the alert only until the project is loaded again.
const PackRemovedAlert: React.FunctionComponent = () => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) {
    return null;
  }

  return (
    <Alert
      id="packRemovedAlert"
      className={moduleStyles.inWorkspaceContainer}
      text={WARNING_BANNER_MESSAGES.MUSIC_PACK_REMOVED}
      type="info"
      size="xs"
      onClose={() => setIsDismissed(true)}
    />
  );
};

export default PackRemovedAlert;
