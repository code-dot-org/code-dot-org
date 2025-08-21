import {Theme} from '@code-dot-org/component-library/common/contexts';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {WithTooltip} from '@code-dot-org/component-library/tooltip';
import React from 'react';

import styles from './styles.module.scss';

interface ButtonWithDialogProps {
  text: string;
  id: string;
  theme: Theme;
  Dialog: React.ReactNode;
  iconName: string;
  setIsDialogOpen: (isOpen: boolean) => void;
}

const ButtonWithDialog: React.FunctionComponent<ButtonWithDialogProps> = ({
  text,
  id,
  theme,
  Dialog,
  iconName,
  setIsDialogOpen,
}) => {
  return (
    <>
      <WithTooltip
        tooltipProps={{
          text: text,
          tooltipId: `tooltip-${id}`,
          direction: 'onRight',
          size: 'xs',
          'data-theme': theme,
        }}
      >
        <button
          type="button"
          className={styles.bottomButton}
          onClick={() => setIsDialogOpen(true)}
          id={`uitest-${id}-button`}
        >
          <FontAwesomeV6Icon iconName={iconName} />
        </button>
      </WithTooltip>
      {Dialog}
    </>
  );
};

export default ButtonWithDialog;
