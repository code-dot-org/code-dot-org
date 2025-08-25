import {Button} from '@code-dot-org/component-library/button';
import {Theme} from '@code-dot-org/component-library/common/contexts';
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
        <Button
          className={styles.bottomButton}
          onClick={() => setIsDialogOpen(true)}
          id={`uitest-${id}-button`}
          isIconOnly={true}
          icon={{iconName: iconName}}
          color={'gray'}
          type={'tertiary'}
        />
      </WithTooltip>
      {Dialog}
    </>
  );
};

export default ButtonWithDialog;
