import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import React from 'react';

import moduleStyles from '@cdo/apps/codebridge/FileBrowser/styles/filebrowser.module.scss';

const BackpackErrorAlertBody: React.FunctionComponent<{
  message: string;
}> = ({message}) => (
  <div className={moduleStyles.backpackErrorContainer}>
    <FontAwesomeV6Icon
      iconName="circle-exclamation"
      iconStyle="regular"
      className={moduleStyles.alertIcon}
    />
    <span className={moduleStyles.backpackErrorMessage}>{message}</span>
  </div>
);
export default BackpackErrorAlertBody;
