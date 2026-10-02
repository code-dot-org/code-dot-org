import type {FunctionComponent, ReactNode} from 'react';

import {useTheme} from '@code-dot-org/component-library/common/contexts';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {
  BodyTwoText,
  Heading3,
} from '@code-dot-org/component-library/typography';

type PendingDialogTitleProps =
  | {
      title?: never;
      titleComponent?: ReactNode;
    }
  | {
      title?: string;
      titleComponent?: never;
    };

type PendingDialogBodyProps =
  | {
      message?: never;
      bodyComponent?: ReactNode;
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

const PendingDialog: FunctionComponent<PendingDialogProps> = ({
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
        <Heading3 className={moduleStyles.title}>{title}</Heading3>
      ) : null}
      {hasBodyComponent ? bodyComponent : <BodyTwoText>{message}</BodyTwoText>}
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
