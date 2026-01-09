import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import Modal from '@code-dot-org/component-library/modal';
import {BodyTwoText} from '@code-dot-org/component-library/typography';
import React from 'react';

export type dialogCallback = (args?: unknown) => void;

type PendingDialogTitleProps = {
  title?: string;
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
  message,
  bodyComponent,
}) => {
  const customContent = (
    <>
      {bodyComponent || (message && <BodyTwoText>{message}</BodyTwoText>)}
      <div className={moduleStyles.spinnerContainer}>
        <FontAwesomeV6Icon
          iconName="spinner"
          animationType="spin"
          className={moduleStyles.spinnerIcon}
        />
      </div>
    </>
  );

  return (
    <Modal
      title={title}
      customContent={customContent}
      className={moduleStyles.genericDialog}
      primaryButtonProps={{isPending: true, text: 'Loading', onClick: () => {}}}
    />
  );
};

export default PendingDialog;
