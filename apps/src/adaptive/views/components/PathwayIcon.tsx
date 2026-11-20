import FontAwesomeV6Icon, {
  FontAwesomeV6IconProps,
  kitIcons,
} from '@code-dot-org/component-library/fontAwesomeV6Icon';
import React from 'react';

// Pathway JSON names icons from Font Awesome and from our kit alike; a kit
// icon renders nothing without the kit family.
const PathwayIcon: React.FunctionComponent<FontAwesomeV6IconProps> = ({
  iconName,
  ...props
}) => (
  <FontAwesomeV6Icon
    iconName={iconName}
    iconFamily={kitIcons.has(iconName) ? 'kit' : undefined}
    {...props}
  />
);

export default PathwayIcon;
