import classNames from 'classnames';
import React, {AriaAttributes} from 'react';

import {getAriaPropsFromProps} from '@cdo/apps/componentLibrary/common/helpers';

export interface FontAwesomeV6IconProps extends AriaAttributes {
  /**
   * Icon style.
   * Style vs Figma font-weight:
   *  * solid - 900
   *  * regular - 400
   *  * light - 300
   *  * thin - 100
   * */
  iconStyle?: 'solid' | 'regular' | 'light' | 'thin';
  /** Icon name */
  iconName: string;
  /** FontAwesome V6 Animation type to use (use it if we want/need to animate icon)*/
  animationType?:
    | 'beat'
    | 'beat-fade'
    | 'bounce'
    | 'fade'
    | 'flip'
    | 'shake'
    | 'spin'
    | 'spin-pulse';
  /**
   *  Icon title.
   *  Title should be used for semantic icons. If not given, the screenreader will not read the icon
   *  See https://fontawesome.com/docs/web/dig-deeper/accessibility#icons-used-as-semantic-elements*/
  title?: string;
  /** Custom className */
  className?: string;
}

/**
 * ### Production-ready Checklist:
 * * (✔) implementation of component approved by design team;
 * * (✔) has storybook, covered with stories and documentation;
 * * (✔) has tests: test every prop, every state and every interaction that's js related;
 * * (see apps/test/unit/componentLibrary/FontAwesomeV6IconTest.jsx)
 * * (?) passes accessibility checks;
 *
 * ###  Status: ```Ready for dev```
 *
 * Design System: FontAwesomeV6Icon Component.
 * Simple shortcut for FontAwesomeV6 icons. Requires FontAwesomeV6 to be installed.
 * Not a part of Design System in Figma initially, but is used in some of Design System components.
 * Can can be used in any component in/out of the scope of Design System.
 */
const FontAwesomeV6Icon: React.FunctionComponent<FontAwesomeV6IconProps> = ({
  iconStyle = 'solid',
  iconName,
  className,
  title,
  animationType,
  ...rest
}) => {
  const ariaProps = getAriaPropsFromProps(rest);

  return (
    <i
      data-testid="font-awesome-v6-icon"
      className={classNames(
        iconStyle && `fa-${iconStyle}`,
        iconName && `fa-${iconName}`,
        animationType && `fa-${animationType}`,
        className
      )}
      title={title}
      {...ariaProps}
    />
  );
};

export default FontAwesomeV6Icon;
