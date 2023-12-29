import React from 'react';
import classnames from 'classnames';

import {ComponentSizeXSToL} from '@cdo/apps/componentLibrary/common/types';

import SegmentedButton, {
  SegmentedButtonModel,
  SegmentButtonType,
} from './_SegmentedButton';
import moduleStyles from './segmentedButtons.module.scss';

export interface SegmentedButtonsProps {
  /** Array of props for Segmented Buttons to render */
  buttons: SegmentedButtonModel[];
  /** Segmented Buttons Size*/
  size?: ComponentSizeXSToL;
  /** Segmented Buttons Type (visual)*/
  type?: SegmentButtonType;
  /** Segmented Buttons selected button unique value */
  selectedButtonValue: string;
  /** Segmented Buttons onChange handler */
  onChange: (value: string) => void;
}

// Todo:
// 8. Add aria attributes
// 9. Add tests
// 16. Add selected change logic (to storybook or to the component itself) ++
// 10. Add storybook ++
// 11. Add documentation ++
// 12. Add prop types ++
// 13. Add default props ++
// 14. Add sizes ++
// 15. Add icons ++
// 7. Add keyboard navigation ++
// 5. Add focus state ++
// 4. Add hover state ++
// 2. Add selected state ++
// 3. Add disabled state ++
// 6. Add active state ++
// 16. check different types appearance ++

/**
 * ### Production-ready Checklist:
 * * (?) implementation of component approved by design team;
 * * (?) has storybook, covered with stories and documentation;
 * * (?) has tests: test every prop, every state and every interaction that's js related;
 * * (see apps/test/unit/componentLibrary/SegmentedButtonsTest.jsx)
 * * (?) passes accessibility checks;
 *
 * ###  Status: ```Wip```
 * Design System: Segmented Buttons Component.
 * Can be used to render Segmented Buttons. (Group of Buttons)
 */
const SegmentedButtons: React.FunctionComponent<SegmentedButtonsProps> = ({
  buttons,
  selectedButtonValue,
  onChange,
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
      {buttons.map(({label, disabled, iconLeft, iconRight, icon, value}) => (
        <SegmentedButton
          key={label}
          selected={selectedButtonValue === value}
          label={label}
          onChange={onChange}
          disabled={disabled}
          iconLeft={iconLeft}
          iconRight={iconRight}
          icon={icon}
          buttonType={type}
          value={value}
        />
      ))}
    </div>
  );
};

export default SegmentedButtons;
