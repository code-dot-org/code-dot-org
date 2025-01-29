import '@code-dot-org/component-library/button/index.css';
import {
  ButtonColor,
  ButtonType,
  LinkButton,
} from '@code-dot-org/component-library/button';
import React from 'react';

type ButtonProps = {
  /** Button text */
  text?: string;
  /** Button color */
  color: Extract<ButtonColor, 'purple' | 'black' | 'white'>;
  /** Button type (semantic) */
  type: Extract<ButtonType, 'primary' | 'secondary'>;
  /** Button link href */
  href?: string;
  /** Button link target (where to open link) */
  target?: string;
  /** Button allows to download file via provided href, allows to set downloaded filename*/
  download?: string;
  /** Is Button disabled */
  disabled?: boolean;
  /** Is Button pending */
  isPending?: boolean;
  /** Button link title */
  title?: string;
};

// TODO:
// - add iconLeftName
// - add iconLeftGroup
// - add iconRightName
// - add iconRightGroup
// - add target prop validations
// -

const Button: React.FunctionComponent<ButtonProps> = ({
  text,
  color,
  type,
  href,
  target,
  download,
  disabled,
  isPending,
}) => {
  return (
    <LinkButton
      text={text}
      size="m"
      href={href}
      target={target}
      type={type}
      color={color}
      download={download}
      disabled={disabled}
      isPending={isPending}
    />
  );
};

export default Button;
