import {useTheme} from '@code-dot-org/component-library/common/contexts';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography} from '@mui/material';
import React from 'react';

export type dialogCallback = (args?: unknown) => void;

type PendingDialogTitleProps =
  | {
      title?: never;
      titleComponent?: React.ReactNode;
    }
  | {
      title?: string;
      titleComponent?: never;
    };

type PendingDialogBodyProps =
  | {
      message?: never;
      bodyComponent?: React.ReactNode;
    }
  | {
      message?: string;
      bodyComponent?: never;
    };
export type PendingDialogProps = PendingDialogTitleProps &
  PendingDialogBodyProps;

import moduleStyles from './generic-dialog.module.scss';

/**
 * Pending dialog UI used in Lab2 labs.
 */

const PendingDialog: React.FunctionComponent<PendingDialogProps> = ({
  title,
  titleComponent,
  message,
  bodyComponent,
}) => {
  const {theme} = useTheme();
  const hasBodyComponent = !!bodyComponent;
  return (
    <div className={moduleStyles['genericDialog-' + theme]}>
      {titleComponent ? (
        titleComponent
      ) : title ? (
        <Typography className={moduleStyles.title} variant="h3" gutterBottom>
          {title}
        </Typography>
      ) : null}
      {hasBodyComponent ? (
        bodyComponent
      ) : (
        <Typography variant="body2" gutterBottom>
          {message}
        </Typography>
      )}
      <div className={moduleStyles.spinnerContainer}>
        <FontAwesomeV6Icon
          iconName="spinner"
          animationType="spin"
          className={moduleStyles.spinnerIcon}
        />
      </div>
    </div>
  );
};

export default PendingDialog;
