import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton} from '@mui/material';
import React from 'react';

import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import commonI18n from '@cdo/locale';

import moduleStyles from './share-layout.module.scss';

interface ShareButtonPanelProps {
  hideViewCode?: boolean;
  children?: React.ReactNode;
}

/**
 * The sidebar shown alongside a shared project: buttons to view the project's
 * code (optionally hidden), remix it, or report abuse.
 */
const ShareButtonPanel: React.FunctionComponent<ShareButtonPanelProps> = ({
  hideViewCode,
  children,
}) => {
  const projectManager = Lab2Registry.getInstance().getProjectManager();
  const onViewCode = () => {
    projectManager?.redirectToView();
  };
  const onRemix = () => {
    projectManager?.redirectToRemix();
  };

  return (
    <div className={moduleStyles.sidebar}>
      {children}
      {!hideViewCode && (
        <MuiButton
          variant="text"
          color="secondary"
          size="extraSmall"
          onClick={onViewCode}
          type="button"
          startIcon={<FontAwesomeV6Icon iconStyle="solid" iconName="code" />}
        >
          {commonI18n.viewCode()}
        </MuiButton>
      )}
      <MuiButton
        variant="text"
        color="secondary"
        size="extraSmall"
        onClick={onRemix}
        type="button"
        startIcon={
          <FontAwesomeV6Icon iconStyle="regular" iconName="pen-to-square" />
        }
      >
        {commonI18n.makeMyOwn()}
      </MuiButton>
      <MuiButton
        variant="text"
        color="secondary"
        size="extraSmall"
        onClick={() => window.open('/report_abuse', '_blank')}
        type="button"
        startIcon={
          <FontAwesomeV6Icon
            iconStyle="regular"
            iconName="message-exclamation"
          />
        }
      >
        {'Report abuse'}
      </MuiButton>
    </div>
  );
};

export default ShareButtonPanel;
