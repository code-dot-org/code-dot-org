import classNames from 'classnames';
import React, {memo, useMemo} from 'react';

import {ButtonType, ButtonColor} from '@cdo/apps/componentLibrary/button';
import FontAwesomeV6Icon, {
  FontAwesomeV6IconProps,
} from '@cdo/apps/componentLibrary/fontAwesomeV6Icon';
import {ComponentSizeXSToL} from '@cdo/apps/componentLibrary/common/types';

import moduleStyles from './_baseButton.module.scss';

export interface _BaseButtonProps {
  /** Button Component type */
  type?: ButtonType;
  /** Custom class name */
  className?: string;
  /** Button id */
  id?: string;
  /** Button color */
  color?: ButtonColor;
  /** Button text */
  text?: string;
  /** Is button disabled */
  disabled?: boolean;
  /** Is button pending */
  isPending?: boolean;
  /** Button aria-label */
  ariaLabel?: string;
  /** Size of button */
  size?: ComponentSizeXSToL;
  /** Left Button icon */
  iconLeft?: FontAwesomeV6IconProps;
  /** Button icon (When used in IconOnly mode)*/
  icon?: FontAwesomeV6IconProps;
  /** Left Button icon */
  iconRight?: FontAwesomeV6IconProps;
  /** Whether we use \<a> (when set to true) or \<button> (when false) html tag for Button component.
   * If we want button to redirect to another page or download some file we should use \<a> tag.
   * If we want button to call some function or submit some form we should use \<button> tag.
   * */
  useAsLink?: boolean;
  /** (\<button> specific prop)
   * Button html element type */
  buttonType?: 'submit' | 'button';
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

const checkButtonPropsForErrors = ({
  type,
  icon,
  useAsLink,
  onClick,
  href,
  download,
  text,
}: _BaseButtonProps) => {
  if (useAsLink && !href) {
    throw new Error('Expect href prop when useAsLink is true');
  }

  if (useAsLink && onClick) {
    throw new Error(
      'Expect onClick prop to be undefined when useAsLink is true'
    );
  }

  if (!useAsLink && !onClick) {
    throw new Error('Expect onClick prop when useAsLink is false');
  }

  if (!useAsLink && href) {
    throw new Error('Expect href prop to be undefined when useAsLink is false');
  }

  if (!useAsLink && download) {
    throw new Error(
      'Expect download prop to be undefined when useAsLink is false'
    );
  }

  if (type !== 'iconOnly' && type !== 'iconBorder' && icon) {
    throw new Error(
      'Expect icon prop to be undefined when type is not iconOnly or iconBorder. (Please remove icon)'
    );
  }

  if ((type === 'iconOnly' || type === 'iconBorder') && !icon) {
    throw new Error(
      'Expect icon prop not to be undefined when type is iconOnly or iconBorder. (Please add icon)'
    );
  }
  if (type !== 'iconOnly' && type !== 'iconBorder' && !text) {
    throw new Error(
      'Expect text prop not to be undefined when type is not iconOnly or iconBorder. (Please add text)'
    );
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
  text,
  disabled = false,
  isPending = false,
  ariaLabel,
  iconLeft,
  iconRight,
  icon,
  size = 'm',
  type = 'primary',
  color = 'purple',
  buttonType = 'button',
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
      : {type: buttonType, onClick, value, name};

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
      }),
    [type, icon, useAsLink, onClick, href, download, text]
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
        addPendingButtonWithHiddenTextClass &&
          moduleStyles.buttonPendingWithHiddenText,
        className
      )}
      id={id}
      disabled={disabled}
      aria-disabled={disabled}
      aria-label={ariaLabel}
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
