import React from 'react';
import classnames from 'classnames';

import {ComponentSizeXSToL} from '@cdo/apps/componentLibrary/common/types';

import SegmentedButton, {
  SegmentedButtonProps,
  SegmentButtonType,
} from './_SegmentedButton';
import moduleStyles from './segmentedButtons.module.scss';

export interface SegmentedButtonsProps {
  /** Array of props for Segmented Buttons to render */
  buttons: SegmentedButtonProps[];
  /** Segmented Buttons Size*/
  size?: ComponentSizeXSToL;
  /** Segmented Buttons Type (visual)*/
  type?: SegmentButtonType;
}

// Todo:
// 2. Add selected state
// 3. Add disabled state
// 6. Add active state
// 16. check different types appearance
// 8. Add aria attributes
// 9. Add tests
// 10. Add storybook ++
// 11. Add documentation ++
// 12. Add prop types ++
// 13. Add default props ++
// 14. Add sizes ++
// 15. Add icons ++
// 7. Add keyboard navigation ++
// 5. Add focus state ++
// 4. Add hover state ++

/**
 * ### Production-ready Checklist:
 * * (?) implementation of component approved by design team;
 * * (?) has storybook, covered with stories and documentation;
 * * (?) has tests: test every prop, every state and every interaction that's js related;
 * * (see apps/test/unit/componentLibrary/RadioButtonTest.jsx, apps/test/unit/componentLibrary/SegmentedButtonTest.jsx)
 * * (?) passes accessibility checks;
 *
 * ###  Status: ```Wip```
 * Design System: Segmented Buttons Component.
 * Can be used to render Segmented Buttons. (Group of Buttons)
 */
const SegmentedButtons: React.FunctionComponent<SegmentedButtonsProps> = ({
  buttons,
  size = 'm',
  type = 'withLabel',
}) => {
  return (
    <div
      className={classnames(
        moduleStyles.segmentedButtons,
        moduleStyles[`segmentedButtons-${size}`]
      )}
    >
      {buttons.map(({label, onClick, disabled, iconLeft, iconRight}) => (
        <SegmentedButton
          key={label}
          label={label}
          onClick={onClick}
          disabled={disabled}
          iconLeft={iconLeft}
          iconRight={iconRight}
          buttonType={type}
        />
      ))}
    </div>
  );
};

export default SegmentedButtons;
