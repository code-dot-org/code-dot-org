import classNames from 'classnames';
import React, {memo, useMemo, HTMLAttributes} from 'react';

import {ButtonType, ButtonColor} from '@cdo/apps/componentLibrary/button';
import {ComponentSizeXSToL} from '@cdo/apps/componentLibrary/common/types';
import FontAwesomeV6Icon, {
  FontAwesomeV6IconProps,
} from '@cdo/apps/componentLibrary/fontAwesomeV6Icon';

import moduleStyles from './_baseButton.module.scss';

export interface TextButtonSpecificProps {
  /** Left Button icon */
  iconLeft?: FontAwesomeV6IconProps;
  /** Button text */
  text?: string;
  /** Left Button icon */
  iconRight?: FontAwesomeV6IconProps;
}

export interface IconOnlyButtonSpecificProps {
  /** Whether button should be icon only (meaning that only 1 icon will be rendered) */
  isIconOnly?: boolean;
  /** Button icon (When used in IconOnly mode)*/
  icon?: FontAwesomeV6IconProps;
}

export interface CoreButtonProps
  extends TextButtonSpecificProps,
    IconOnlyButtonSpecificProps,
    HTMLAttributes<HTMLButtonElement | HTMLAnchorElement> {
  /** Button Component type */
  type?: ButtonType;
  /** Custom class name */
  className?: string;
  /** Button id */
  id?: string;
  /** Button color */
  color?: ButtonColor;
  /** Is button disabled */
  disabled?: boolean;
  /** Is button pending */
  isPending?: boolean;
  /** Button aria-label */
  ariaLabel?: string;
  /** OnClick handler for the button */
  onClick?: (
    event:
      | React.MouseEvent<HTMLButtonElement>
      | React.MouseEvent<HTMLAnchorElement>
  ) => void;
  /** Size of button */
  size?: ComponentSizeXSToL;
}

export interface LinkButtonSpecificProps {
  /** Whether we use \<a> (when set to true) or \<button> (when false) html tag for Button component.
   * If we want button to redirect to another page or download some file we should use \<a> tag.
   * If we want button to call some function or submit some form we should use \<button> tag.
   * */
  useAsLink?: boolean;
  /** (\<a> specific prop)
   *  Button target (when used as link) */
  target?: string;
  /** (\<a> specific prop)
   * Button href */
  href?: string;
  /** (\<a> specific prop)
   * Button download (when used as link) */
  download?: boolean | string;
  /** (\<a> specific prop)
   * Button title */
  title?: string;
}

export interface ButtonSpecificProps {
  /** (\<button> specific prop)
   * Button html element type */
  buttonTagTypeAttribute?: 'submit' | 'button';
  /** (\<button> specific prop)
   *  Button onClick */
  onClick?: (
    event:
      | React.MouseEvent<HTMLButtonElement>
      // This is a workaround to fix TS error not allowing us to use Tag and tagSpecificProps logic.
      //   onClick Should only be applied to <button> elements, but not to <a> elements.
      | React.MouseEvent<HTMLAnchorElement>
  ) => void;
  /** (\<button> specific prop)
   *  Button value */
  value?: string;
  /** (\<button> specific prop)
   *  Button name */
  name?: string;
}

export interface _BaseButtonProps
  extends CoreButtonProps,
    LinkButtonSpecificProps,
    ButtonSpecificProps {}

const checkButtonPropsForErrors = ({
  icon,
  useAsLink,
  onClick,
  href,
  download,
  text,
  isIconOnly,
  color,
  type,
}: _BaseButtonProps) => {
  if (color === 'gray' && type !== 'secondary') {
    throw new Error('Expect type prop to be secondary when color is gray');
  }

  if (color === 'purple' && type === 'secondary') {
    console.warn(
      'Warning: Button - Secondary Purple color is now deprecated. Please use different color or type. Secondary purple combination will be removed very soon.'
    );
  }

  if (useAsLink) {
    if (!href) {
      throw new Error('Expect href prop when useAsLink is true');
    }

    if (onClick) {
      throw new Error(
        'Expect onClick prop to be undefined when useAsLink is true'
      );
    }
  }

  if (!useAsLink) {
    if (!onClick) {
      throw new Error('Expect onClick prop when useAsLink is false');
    }

    if (href) {
      throw new Error(
        'Expect href prop to be undefined when useAsLink is false'
      );
    }

    if (download) {
      throw new Error(
        'Expect download prop to be undefined when useAsLink is false'
      );
    }
  }

  if (isIconOnly) {
    if (!icon) {
      throw new Error('Expect icon prop when isIconOnly is true');
    }
    if (text) {
      throw new Error(
        'Expect text prop to be undefined when isIconOnly is true'
      );
    }
  }

  if (!isIconOnly) {
    if (icon) {
      throw new Error(
        'Expect icon prop to be undefined when isIconOnly is false'
      );
    }

    if (!text) {
      throw new Error('Expect text prop when isIconOnly is false');
    }
  }
};

const spinnerIcon: FontAwesomeV6IconProps = {
  iconName: 'spinner',
  iconStyle: 'solid',
  animationType: 'spin',
};

const BaseButton: React.FunctionComponent<_BaseButtonProps> = ({
  className,
  id,
  disabled = false,
  isPending = false,
  ariaLabel,
  size = 'm',
  type = 'primary',
  color = 'purple',
  buttonTagTypeAttribute = 'button',
  /** Text button specific props */
  iconLeft,
  iconRight,
  text,
  /** IconOnly button specific props*/
  isIconOnly = false,
  icon,
  /** <a> specific props */
  useAsLink = false,
  href,
  target,
  download,
  title,
  /** <button> specific props */
  onClick,
  value,
  name,
  ...rest
}) => {
  const ButtonTag = useAsLink ? 'a' : 'button';

  const tagSpecificProps =
    ButtonTag === 'a'
      ? {
          href: disabled ? undefined : href,
          target,
          /** Copied from old button component. Only need it for the older browsers,
           *  since modern browsers (~2020+ release year secures these vulnerabilities by default) */
          // Opening links in new tabs with 'target=_blank' is inherently insecure. Unfortunately, we depend
          // on this functionality in a couple of place. Fortunately, it is possible to partially mitigate some of
          // the insecurity of this functionality by using the `rel` tag to block some of the potential exploits.
          // Therefore, we do so here.
          rel: target === '_blank' ? 'noopener noreferrer' : undefined,
          download,
          title,
        }
      : {type: buttonTagTypeAttribute, onClick, value, name};

  // Check if correct props combination is passed
  useMemo(
    () =>
      checkButtonPropsForErrors({
        type,
        icon,
        useAsLink,
        onClick,
        href,
        download,
        text,
        isIconOnly,
        color,
      }),
    [type, icon, useAsLink, onClick, href, download, text, isIconOnly, color]
  );

  /** Handling isPending state content & spinner show logic here.
     - If there's only text - we show only spinner.
     - If there's only icon - we show only spinner.
     - If there's text and iconLeft or both iconLeft and iconRight -> we show spinner on the left + text + iconRight (if it's present).
     - If there's text and iconRight - we show text + spinner on the right.
     */
  const showIcon = icon && !isPending;
  const showIconLeft = iconLeft && !isPending;
  const showIconRight =
    (iconRight && !isPending) || (isPending && iconRight && iconLeft);
  const addPendingButtonWithHiddenTextClass =
    isPending && !icon && !iconLeft && !iconRight;
  const spinnerPosition = iconRight && !iconLeft ? 'right' : 'left';

  return (
    <ButtonTag
      className={classNames(
        moduleStyles.button,
        moduleStyles[`button-${type}`],
        moduleStyles[`button-${color}`],
        moduleStyles[`button-${size}`],
        isIconOnly && moduleStyles['button-iconOnly'],
        addPendingButtonWithHiddenTextClass &&
          moduleStyles.buttonPendingWithHiddenText,
        className
      )}
      id={id}
      disabled={disabled}
      {...rest}
      aria-disabled={disabled || rest['aria-disabled']}
      aria-label={ariaLabel || rest['aria-label']}
      {...tagSpecificProps}
    >
      {isPending && spinnerPosition === 'left' && (
        <FontAwesomeV6Icon {...spinnerIcon} />
      )}
      {showIconLeft && <FontAwesomeV6Icon {...iconLeft} />}
      {showIcon && <FontAwesomeV6Icon {...icon} />}
      {text && <span>{text}</span>}
      {showIconRight && <FontAwesomeV6Icon {...iconRight} />}
      {isPending && spinnerPosition === 'right' && (
        <FontAwesomeV6Icon {...spinnerIcon} />
      )}
    </ButtonTag>
  );
};

/**
 * ### Production-ready Checklist:
 * * (✔) implementation of component approved by design team;
 * * (✔) has storybook, covered with stories and documentation;
 * * (✔) has tests: test every prop, every state and every interaction that's js related;
 * * (see apps/test/unit/componentLibrary/_BaseButtonTest.jsx)
 * * (?) passes accessibility checks;
 *
 * ###  Status: ```Ready for dev```
 *
 * Design System: ***_BaseButton*** Component.
 *
 * ***(!IMPORTANT!)*** This is a private component for Designs System use only. It provides a base for ***Button***
 * and ***LinkButton*** components, implementing all of the logic and styles for them.
 */
export default memo(BaseButton);
