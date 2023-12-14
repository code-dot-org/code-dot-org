import React from 'react';
import classnames from 'classnames';

import Typography from '@cdo/apps/componentLibrary/typography';
import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon';
import moduleStyles from './segmentedButtons.module.scss';

type SegmentedButtonIconProps = {
  iconName: string;
  iconStyle: 'light' | 'solid' | 'regular' | 'thin';
  title: string;
};
type SegmentedButtonProps = {
  /** Button Label */
  label?: string;
  disabled?: boolean;
  selected?: boolean;
  onClick: () => void;
  iconLeft?: SegmentedButtonIconProps;
  iconRight?: SegmentedButtonIconProps;
};

export interface SegmentedButtonsProps {
  /** Array of props for Segmented Buttons to render */
  buttons: SegmentedButtonProps[];
  /** Segmented Button Size*/
  size?: 'xs' | 's' | 'm' | 'l';
}

// Todo:
// 2. Add selected state
// 3. Add disabled state
// 4. Add hover state ++
// 5. Add focus state ++
// 6. Add active state
// 7. Add keyboard navigation ++
// 8. Add aria attributes
// 9. Add tests
// 10. Add storybook
// 11. Add documentation
// 12. Add prop types
// 13. Add default props
// 14. Add sizes ++
// 15. Add icons ++

/**
 * ### Production-ready Checklist:
 * * (?) implementation of component approved by design team;
 * * (?) has storybook, covered with stories and documentation;
 * * (?) has tests: test every prop, every state and every interaction that's js related;
 * * (see apps/test/unit/componentLibrary/RadioButtonTest.jsx, apps/test/unit/componentLibrary/RadioButtonsGroupTest.jsx)
 * * (?) passes accessibility checks;
 *
 * ###  Status: ```Wip```
 * Design System: Segmented Buttons Component.
 * Can be used to render Segmented Buttons. (Group of Buttons)
 */
const SegmentedButtons: React.FunctionComponent<SegmentedButtonsProps> = ({
  buttons,
  size = 'm',
}) => {
  return (
    <div className={moduleStyles.segmentedButtonsContainer}>
      {buttons.map(({label, onClick, disabled, iconLeft, iconRight}) => (
        <button
          type="button"
          disabled={disabled}
          onClick={onClick}
          key={label}
          className={classnames(
            moduleStyles.segmentedButton,
            moduleStyles[`segmentedButton-${size}`]
          )}
        >
          {iconLeft && (
            <FontAwesomeV6Icon
              iconName={iconLeft.iconName}
              iconStyle={iconLeft.iconStyle}
              title={iconLeft.title}
            />
          )}
          {label && <span>{label}</span>}
          {iconRight && (
            <FontAwesomeV6Icon
              iconName={iconRight.iconName}
              iconStyle={iconRight.iconStyle}
              title={iconRight.title}
            />
          )}
        </button>
      ))}
    </div>
  );
};

export default SegmentedButtons;
