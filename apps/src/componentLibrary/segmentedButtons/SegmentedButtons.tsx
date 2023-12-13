import React from 'react';
import classnames from 'classnames';

import Typography from '@cdo/apps/componentLibrary/typography';
import moduleStyles from './segmentedButtons.module.scss';

type SegmentedButtonProps = {
  /** Button Label */
  label: string;
  selected?: boolean;
  onClick: () => void;
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
// 4. Add hover state
// 5. Add focus state
// 6. Add active state
// 7. Add keyboard navigation
// 8. Add aria attributes
// 9. Add tests
// 10. Add storybook
// 11. Add documentation
// 12. Add prop types
// 13. Add default props
// 14. Add sizes
// 15. Add icons

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
      {buttons.map(({label, onClick}) => (
        <button
          type="button"
          onClick={onClick}
          key={label}
          className={classnames(
            moduleStyles.segmentedButton,
            moduleStyles[`segmentedButton-${size}`]
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export default SegmentedButtons;
