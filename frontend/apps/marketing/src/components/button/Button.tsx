import '@code-dot-org/component-library/button/index.css';
import {
  ButtonColor,
  ButtonType,
  LinkButton,
} from '@code-dot-org/component-library/button';
import React from 'react';

type IconStyleType = 'solid' | 'regular' | 'light' | 'thin';
type IconFamilyType = 'brands' | 'duotone' | 'kit';

export const iconStyles: IconStyleType[] = [
  'solid',
  'regular',
  'light',
  'thin',
];
export const iconFamilies: (IconFamilyType | '')[] = [
  'brands',
  'duotone',
  'kit',
  '',
];

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
  /** Button left icon name */
  iconLeftName?: string;
  /** Button left icon group */
  iconLeftStyle?: IconStyleType;
  /** Button left icon family */
  iconLeftFamily?: IconFamilyType;
  /** Button right icon name */
  iconRightName?: string;
  /** Button right icon group */
  iconRightStyle?: IconStyleType;
  /** Button right icon family */
  iconRightFamily?: IconFamilyType;
};

// TODO:
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
  iconLeftName,
  iconLeftStyle = 'solid',
  iconLeftFamily,
  iconRightName,
  iconRightStyle = 'solid',
  iconRightFamily,
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
      iconLeft={
        iconLeftName
          ? {
              iconName: iconLeftName,
              iconStyle: iconLeftStyle,
              iconFamily: iconLeftFamily,
            }
          : undefined
      }
      iconRight={
        iconRightName
          ? {
              iconName: iconRightName,
              iconStyle: iconRightStyle,
              iconFamily: iconRightFamily,
            }
          : undefined
      }
    />
  );
};

export default Button;
