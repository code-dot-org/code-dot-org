import React from 'react';
import classNames from 'classnames';

export interface FontAwesomeV6IconProps {
  /**
   * Icon style.
   * Style vs Figma font-weight:
   *  * solid - 900
   *  * regular - 400
   *  * light - 300
   *  * thin - 100
   * */
  iconStyle: 'solid' | 'regular' | 'light' | 'thin';
  /** Icon name */
  iconName: string;
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
 * * (?) has tests: test every prop, every state and every interaction that's js related;
 * * (see apps/test/unit/componentLibrary/FontAwesomeV6IconTest.jsx)
 * * (?) passes accessibility checks;
 *
 * ###  Status: ```Ready for dev```
 *
 * Design System: FontAwesomeV6Icon Component.
 * Simple shortcut for FontAwesomeV6 icons. Requires FontAwesomeV6 to be installed.
 * Not a part of Design System in Figma initially, though can be used in any component.
 */
const FontAwesomeV6Icon: React.FunctionComponent<FontAwesomeV6IconProps> = ({
  iconStyle,
  iconName,
  className,
  title,
}) => {
  return (
    <i
      data-testid="font-awesome-v6-icon"
      className={classNames(
        iconStyle && `fa-${iconStyle}`,
        iconName && `fa-${iconName}`,
        className
      )}
      title={title}
    />
  );
};

export default FontAwesomeV6Icon;
