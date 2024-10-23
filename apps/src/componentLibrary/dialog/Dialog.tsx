import classnames from 'classnames';
import React, {HTMLAttributes, ReactNode} from 'react';

import {Button} from '@cdo/apps/componentLibrary/button';
import CloseButton from '@cdo/apps/componentLibrary/closeButton';
import FontAwesomeV6Icon, {
  FontAwesomeV6IconProps,
} from '@cdo/apps/componentLibrary/fontAwesomeV6Icon';

import moduleStyles from './dialog.module.scss';

export interface DialogProps extends HTMLAttributes<HTMLDivElement> {
  /** Dialog type*/
  type?: 'noIcon' | 'withIconFill' | 'withIconFA';
  /** Dialog title */
  title?: string;
  /** Dialog content */
  content?: string | ReactNode;
  /** Whether to show secondary button */
  showSecondaryButton?: boolean;
  /** Custom class name */
  className?: string;
  /** Dialog onClose handler */
  onClose?: () => void;
  /** Dialog close button aria label */
  closeLabel?: string;
  /** Dialog icon */
  icon?: FontAwesomeV6IconProps;
}

/**
 * ## Production-ready Checklist:
 *  * (?) implementation of component approved by design team;
 *  * (?) has storybook, covered with stories and documentation;
 *  * (?) has tests: test every prop, every state and every interaction that's js related;
 *  * (see apps/test/unit/componentLibrary/DialogTest.tsx)
 *  * (?) passes accessibility checks;
 *
 * ###  Status: ```WIP```
 *
 * Design System: Dialog Component.
 * Renders Alert to notify user about something.
 */
const Dialog: React.FunctionComponent<DialogProps> = ({
  title,
  type = 'noIcon',
  content,
  showSecondaryButton,
  className,
  onClose,
  closeLabel = 'Close dialog',
  icon,
  ...HTMLAttributes
}) => {
  return (
    <div
      className={classnames(
        moduleStyles.dialog,
        moduleStyles[`dialog-${type}`],
        className
      )}
      {...HTMLAttributes}
    >
      <div>
        {icon && <FontAwesomeV6Icon {...icon} />}
        <span>{title}</span>
        <span className={moduleStyles.dialogContent}>{content}</span>
        {showSecondaryButton && (
          <Button
            type="secondary"
            color="black"
            text="Secondary Button"
            onClick={() => null}
          />
        )}
        <Button
          type="primary"
          color="purple"
          text="Primary Button"
          onClick={() => null}
        />
      </div>
      {onClose && (
        <CloseButton aria-label={closeLabel} onClick={onClose} size="l" />
      )}
    </div>
  );
};

export default Dialog;
