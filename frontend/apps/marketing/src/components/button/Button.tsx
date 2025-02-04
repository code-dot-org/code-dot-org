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
  /** Is Button disabled */
  disabled?: boolean;
  /** Is Button pending */
  isPending?: boolean;
  /** Button left icon name */
  iconLeftName?: string;
  /** Button left icon is brand icon */
  isLeftIconBrand?: boolean;
  /** Button right icon name */
  iconRightName?: string;
  /** Button right icon is brand icon */
  isRightIconBrand?: boolean;
};

const Button: React.FunctionComponent<ButtonProps> = ({
  text,
  color,
  type,
  href,
  target,
  disabled,
  isPending,
  iconLeftName,
  isLeftIconBrand,
  iconRightName,
  isRightIconBrand,
}) => {
  return (
    <LinkButton
      text={text}
      size="m"
      href={href}
      target={target}
      type={type}
      color={color}
      disabled={disabled}
      isPending={isPending}
      iconLeft={
        iconLeftName
          ? {
              iconName: iconLeftName,
              iconStyle: 'solid',
              iconFamily: isLeftIconBrand ? 'brands' : undefined,
            }
          : undefined
      }
      iconRight={
        iconRightName
          ? {
              iconName: iconRightName,
              iconStyle: 'solid',
              iconFamily: isRightIconBrand ? 'brands' : undefined,
            }
          : undefined
      }
    />
  );
};

export default Button;
