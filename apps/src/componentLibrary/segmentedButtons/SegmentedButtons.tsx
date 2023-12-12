import React from 'react';
import classnames from 'classnames';

import Typography from '@cdo/apps/componentLibrary/typography';
import moduleStyles from './segmentedButtons.module.scss';

type SegmentedButtonProps = {
  label: string;
};

interface SegmentedButtonsProps {
  buttons: SegmentedButtonProps[];
  size?: 'xs' | 's' | 'm' | 'l';
}

// Todo:
// 1. Add onClick handler
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

const SegmentedButtons: React.FunctionComponent<SegmentedButtonsProps> = ({
  buttons,
  size = 'm',
}) => {
  return (
    <div className={moduleStyles.segmentedButtonsContainer}>
      {buttons.map(button => (
        <button
          type="button"
          key={button.label}
          className={classnames(
            moduleStyles.segmentedButton,
            moduleStyles[`segmentedButton-${size}`]
          )}
        >
          {button.label}
        </button>
      ))}
    </div>
  );
};

export default SegmentedButtons;
