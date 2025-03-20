import React, {useMemo} from 'react';

import {
  ButtonColor,
  ButtonType,
  LinkButton,
} from '@code-dot-org/component-library/button';

import {fontAwesomeV6BrandIconsMap} from '@/components/common/constants';

type ButtonProps = {
  /** Button text */
  text?: string;
  /** Button color */
  color: Extract<ButtonColor, 'purple' | 'black' | 'white'>;
  /** Button type (semantic) */
  type: Extract<ButtonType, 'primary' | 'secondary'>;
  /** Button link href */
  href?: string;
  /** Whether Link is for internal code.org pages, or external web page. (external links are opened in new tab) */
  isLinkExternal?: boolean;
  /** Button left icon name */
  iconLeftName?: string;
};

const Button: React.FunctionComponent<ButtonProps> = ({
  text,
  color,
  type,
  href,
  isLinkExternal = false,
  iconLeftName,
}) => {
  const isLeftIconBrand = useMemo(
    () => !!iconLeftName && fontAwesomeV6BrandIconsMap.has(iconLeftName),
    [iconLeftName],
  );
  return (
    <LinkButton
      text={text}
      size="m"
      href={href}
      target={isLinkExternal ? '_blank' : '_self'}
      type={type}
      color={color}
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
        isLinkExternal
          ? {
              iconName: 'up-right-from-square',
              iconStyle: 'solid',
            }
          : undefined
      }
    />
  );
};

export default Button;
