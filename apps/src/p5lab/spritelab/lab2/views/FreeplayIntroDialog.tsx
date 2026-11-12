import {CustomDialog} from '@code-dot-org/component-library/dialog';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton, Typography as MuiTypography} from '@mui/material';
import React from 'react';

import useThemeMode from '@cdo/apps/pixelEditor/useThemeMode';
import illustration from '@cdo/static/spritelab_lab2/freeplay-intro.png';

import moduleStyles from './freeplay-intro.module.scss';

const TITLE = 'Levels complete';

interface FreeplayIntroDialogProps {
  onClose: () => void;
}

/** Opens once on arrival at the free play level. */
const FreeplayIntroDialog: React.FunctionComponent<
  FreeplayIntroDialogProps
> = ({onClose}) => {
  const mode = useThemeMode();
  return (
    <div className={moduleStyles.dialogHost}>
      <CustomDialog
        aria-label={TITLE}
        onClose={onClose}
        mode={mode}
        className={moduleStyles.dialog}
      >
        <div className={moduleStyles.header}>
          <MuiTypography
            variant="overline1"
            component="h2"
            className={moduleStyles.headerLabel}
          >
            {TITLE}
          </MuiTypography>
        </div>
        <div className={moduleStyles.content}>
          <img
            src={illustration}
            alt=""
            className={moduleStyles.illustration}
          />
          <MuiTypography
            variant="h5"
            component="h3"
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
            When you're done, click{' '}
            <strong className={moduleStyles.buttonName}>
              I'm finished
              <FontAwesomeV6Icon iconName="check" />
            </strong>
          </MuiTypography>
        </div>
        <div className={moduleStyles.footer}>
          <MuiButton
            variant="contained"
            color="primary"
            endIcon={<FontAwesomeV6Icon iconName="arrow-right" />}
            onClick={onClose}
          >
            Start free play
          </MuiButton>
        </div>
      </CustomDialog>
    </div>
  );
};

export default FreeplayIntroDialog;
