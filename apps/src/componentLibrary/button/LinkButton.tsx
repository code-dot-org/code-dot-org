import React, {memo} from 'react';

import {ComponentSizeXSToL} from '@cdo/apps/componentLibrary/common/types';
import {FontAwesomeV6IconProps} from '@cdo/apps/componentLibrary/fontAwesomeV6Icon';

import _BaseButton from './_baseButton/_BaseButton';
import {ButtonType, ButtonColor} from './types';

export interface LinkButtonProps {
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
  /** (\<a> specific prop)
   *  Button target (when used as link) */
  target?: string;
  /** (\<a> specific prop)
   * Button href */
  href: string;
  /** (\<a> specific prop)
   * Button download (when used as link) */
  download?: boolean | string;
  /** (\<a> specific prop)
   * Button title */
  title?: string;
}

const LinkButton: React.FunctionComponent<LinkButtonProps> = props => (
  <_BaseButton {...props} useAsLink />
);

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
 * Design System: Button Component.
 * Can be used to render a button or as a part of bigger/more complex components (e.g. Some forms, blocks/cards).
 */
export default memo(LinkButton);
