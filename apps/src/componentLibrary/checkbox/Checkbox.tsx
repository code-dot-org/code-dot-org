import React, {useRef, useEffect, ChangeEvent} from 'react';
import classnames from 'classnames';

import Typography from '@cdo/apps/componentLibrary/typography';
import {ComponentSizeXSToL} from '@cdo/apps/componentLibrary/common/types';
import {componentSizeToBodyTextSizeMap} from '@cdo/apps/componentLibrary/common/constants';
import moduleStyles from './checkbox.module.scss';

export interface CheckboxProps {
  /** Checkbox checked state */
  checked: boolean;
  /** Checkbox onChange handler*/
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  /** The name attribute specifies the name of an input element.
   The name attribute is used to reference elements in a JavaScript,
   or to reference form data after a form is submitted.
   Note: Only form elements with a name attribute will have their values passed when submitting a form. */
  name: string;
  /** The value attribute specifies the value of an input element. */
  value?: string;
  /** Checkbox label */
  label?: string;
  /** Is checkbox disabled */
  disabled?: boolean;
  /** Is checkbox indeterminate */
  indeterminate?: boolean;
  /** Size of checkbox */
  size?: ComponentSizeXSToL;
}

/**
 * ### Production-ready Checklist:
 * * (✔) implementation of component approved by design team;
 * * (✔) has storybook, covered with stories and documentation;
 * * (✔) has tests: test every prop, every state and every interaction that's js related;
 * * (see apps/test/unit/componentLibrary/CheckboxTest.jsx)
 * * (?) passes accessibility checks;
 *
 * ###  Status: ```Ready for dev```
 *
 * Design System: Checkbox Component.
 * Can be used to render a checkbox or as a part of bigger/more complex components (e.g. Checkbox Dropdown).
 */
const Checkbox: React.FunctionComponent<CheckboxProps> = ({
  label,
  checked,
  onChange,
  name,
  value,
  disabled = false,
  indeterminate = false,
  size = 'm',
}) => {
  const checkboxRef = useRef<HTMLInputElement>(null);
  const bodyTextSize = componentSizeToBodyTextSizeMap[size];

  useEffect(() => {
    if (checkboxRef?.current) {
      checkboxRef.current.indeterminate = indeterminate;
    }
  }, [checkboxRef, indeterminate]);

  return (
    <label
      className={classnames(moduleStyles.label, moduleStyles[`label-${size}`])}
    >
      <input
        type="checkbox"
        ref={checkboxRef}
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
      />
      <i className="fa-solid" />
      {label && (
        <Typography semanticTag="span" visualAppearance={bodyTextSize}>
          {label}
        </Typography>
      )}
    </label>
  );
};

export default Checkbox;
