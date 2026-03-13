import classNames from 'classnames';
import {HTMLAttributes} from 'react';

import {ComponentSizeXSToL} from '@/common/types';
import FontAwesomeV6Icon from '@/fontAwesomeV6Icon';

import moduleStyles from './closeButton.module.scss';

export interface CloseButtonProps extends HTMLAttributes<HTMLButtonElement> {
  /** Close Button onClick */
  onClick: (
    e?:
      | React.MouseEvent<HTMLButtonElement>
      | React.KeyboardEvent<HTMLButtonElement>,
  ) => void;
  /** Close Button size */
  size?: ComponentSizeXSToL;
  /** Close Button Color*/
  color?: 'light' | 'dark';
  /** Close Button Custom class name */
  className?: string;
  /** Close Button id */
  id?: string;
  /** Close Button an accessible label indicating invisible label for the Close Button */
  'aria-label': string;
}

/**
 * ### Production-ready Checklist:
 * * (✔) implementation of component approved by design team;
 * * (✔) has storybook, covered with stories and documentation;
 * * (✔) has tests: test every prop, every state and every interaction that's js related;
 * * (see apps/test/unit/componentLibrary/CloseButton.test.tsx)
 * * (?) passes accessibility checks;
 *
 * ###  Status: ```DEPRECATED```
 *
 * @deprecated Use MUI `IconButton` from `@mui/material` with an `xmark` icon instead.
 * Style overrides are in `src/themes/code.org/styleOverrides/iconButton.tsx`.
 */
const CloseButton: React.FunctionComponent<CloseButtonProps> = ({
  onClick,
  size = 'm',
  'aria-label': ariaLabel,
  color = 'dark',
  id,
  className,
  ...HTMLAttributes
}) => (
  <button
    type="button"
    id={id}
    aria-label={ariaLabel}
    className={classNames(
      moduleStyles.closeButton,
      moduleStyles[`closeButton-${color}`],
      moduleStyles[`closeButton-${size}`],
      className,
    )}
    onClick={onClick}
    {...HTMLAttributes}
  >
    <FontAwesomeV6Icon iconName={'close'} />
  </button>
);

export default CloseButton;
