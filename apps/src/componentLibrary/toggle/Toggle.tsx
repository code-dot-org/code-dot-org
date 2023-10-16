import React, {ChangeEvent, memo} from 'react';
import classnames from 'classnames';

import Typography from '@cdo/apps/componentLibrary/typography';
import {ComponentSizeXSToL} from '@cdo/apps/componentLibrary/common/types';
import {componentSizeToBodyTextSizeMap} from '@cdo/apps/componentLibrary/common/constants';

import moduleStyles from './toggle.module.scss';

export interface ToggleProps {
  /** Toggle checked state */
  checked: boolean;
  /** Toggle onChange handler */
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  /** The name attribute specifies the name of an input element.
   The name attribute is used to reference elements in a JavaScript,
   or to reference form data after a form is submitted.
   Note: Only form elements with a name attribute will have their values passed when submitting a form. */
  name: string;
  /** The value attribute specifies the value of an input element. */
  value?: string;
  /** Toggle label*/
  label?: string;
  /** Is Toggle disabled */
  disabled?: boolean;
  /** Toggle switch placement */
  position?: 'left' | 'right';
  /** Size of Radio Button */
  size?: ComponentSizeXSToL;
}

const Toggle: React.FunctionComponent<ToggleProps> = ({
  checked,
  onChange,
  name,
  value,
  label,
  disabled = false,
  position = 'left',
  size = 'm',
}) => {
  const bodyTextSize = componentSizeToBodyTextSizeMap[size];

  return (
    <label
      className={classnames(
        moduleStyles.toggle,
        moduleStyles[`toggle-${size}`],
        position === 'right' && moduleStyles['toggle-right']
      )}
    >
      <div>
        <input
          type="checkbox"
          name={name}
          value={value}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
        />
        <span className={moduleStyles.switch}>
          <i className="fa-solid" />
          <span />
        </span>
      </div>

      {label && (
        <Typography semanticTag="span" visualAppearance={bodyTextSize}>
          {label}
        </Typography>
      )}
    </label>
  );
};

/**
 * ## Production-ready Checklist:
 *  * (✔) implementation of component approved by design team;
 *  * (✔) has storybook, covered with stories and documentation;
 *  * (✔) has tests: test every prop, every state and every interaction that's js related;
 *  * (see apps/test/unit/componentLibrary/ToggleTest.jsx)
 *  * (?) passes accessibility checks;
 *
 * ###  Status: ```Ready for dev```
 *
 * Design System: Toggle Component.
 * Can be used to render a single Toggle component or as a part of bigger/more complex components (e.g. some form, modal, etc).
 */
export default memo(Toggle);
