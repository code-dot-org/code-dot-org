import Alert from '@code-dot-org/component-library/alert';
import React, {useState} from 'react';

import {PROJECT_PACK_REMOVED_MESSAGE} from '../constants';

import moduleStyles from './pack-removed-alert.module.scss';

const PackRemovedAlert: React.FunctionComponent = () => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) {
    return null;
  }

  return (
    <Alert
      id="packRemovedAlert"
      className={moduleStyles.inWorkspaceContainer}
      text={PROJECT_PACK_REMOVED_MESSAGE}
      type="warning"
      isImmediateImportance={false}
      size="xs"
      onClose={() => setIsDismissed(true)}
    />
  );
};

export default PackRemovedAlert;
