import classNames from 'classnames';
import React, {HTMLAttributes} from 'react';

export interface FontAwesomeV6IconProps extends HTMLAttributes<HTMLElement> {
  /**
   * Icon style.
   * Style vs Figma font-weight:
   *  * solid - 900
   *  * regular - 400
   *  * light - 300
   *  * thin - 100
   * */
  iconStyle?: 'solid' | 'regular' | 'light' | 'thin';
  /** Icon family
   *    * brands - for FA brand icons
   *    * duotone - for FA duotone icons
   *    * kit - for our custom FA kit icons
   * */
  iconFamily?: 'brands' | 'duotone' | 'kit';
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
  iconStyle,
  iconFamily,
  iconName,
  className,
  title,
  animationType,
  ...HTMLAttributes
}) => (
  <i
    data-testid="font-awesome-v6-icon"
    className={classNames(
      iconFamily && `fa-${iconFamily}`,
      iconStyle && `fa-${iconStyle}`,
      iconName && `fa-${iconName}`,
      // Default icon style is solid, but only when no iconFamily prop is provided
      !iconFamily && !iconStyle && 'fa-solid',
      animationType && `fa-${animationType}`,
      className
    )}
    title={title}
    {...HTMLAttributes}
  />
);

export default FontAwesomeV6Icon;
