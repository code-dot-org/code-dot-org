import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {
  BodyTwoText,
  Heading3,
} from '@code-dot-org/component-library/typography';
import React, {useContext} from 'react';

import {ThemeContext} from '@cdo/apps/lab2/views/ThemeWrapper';

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
  const {theme} = useContext(ThemeContext);
  return (
    <div className={moduleStyles['genericDialog-' + theme]}>
      {titleComponent ? (
        titleComponent
      ) : title ? (
        <Heading3>{title}</Heading3>
      ) : null}
      {bodyComponent || <BodyTwoText>{message}</BodyTwoText>}
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
