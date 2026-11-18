import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import Modal from '@code-dot-org/component-library/modal';
import {Typography as MuiTypography} from '@mui/material';
import React from 'react';

import illustration from '@cdo/static/spritelab_lab2/freeplay-intro.png';

import moduleStyles from './freeplay-intro.module.scss';

interface FreeplayIntroDialogProps {
  onClose: () => void;
}

/** Opens once on arrival at the free play level. */
const FreeplayIntroDialog: React.FunctionComponent<
  FreeplayIntroDialogProps
> = ({onClose}) => (
  <div className={moduleStyles.dialogHost}>
    <Modal
      title="Levels complete"
      className={moduleStyles.dialog}
      onClose={onClose}
      imageUrl={illustration}
      customContent={
        <div className={moduleStyles.content}>
          <MuiTypography
            variant="h5"
            component="h4"
            className={moduleStyles.title}
          >
            Free play unlocked!
          </MuiTypography>
          <MuiTypography variant="body2" id="dsco-dialog-description">
            Everything is open. Make anything you want!
          </MuiTypography>
          <MuiTypography variant="body2" className={moduleStyles.tip}>
            Find new blocks with{' '}
            <strong className={moduleStyles.buttonName}>
              Discover blocks
              <FontAwesomeV6Icon iconName="magnifying-glass-plus" />
            </strong>
          </MuiTypography>
          <MuiTypography variant="body2" className={moduleStyles.tip}>
            When you're done, select{' '}
            <strong className={moduleStyles.buttonName}>
              I'm finished
              <FontAwesomeV6Icon iconName="check" />
            </strong>
          </MuiTypography>
        </div>
      }
      primaryButtonProps={{
        children: 'Start free play',
        endIcon: <FontAwesomeV6Icon iconName="arrow-right" />,
        onClick: onClose,
      }}
    />
  </div>
);

export default FreeplayIntroDialog;
