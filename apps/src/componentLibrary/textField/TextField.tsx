import classnames from 'classnames';
import React, {ChangeEvent, AriaAttributes} from 'react';

import {componentSizeToBodyTextSizeMap} from '@cdo/apps/componentLibrary/common/constants';
import {ComponentSizeXSToL} from '@cdo/apps/componentLibrary/common/types';
import Typography from '@cdo/apps/componentLibrary/typography';

import moduleStyles from './textfield.module.scss';

export interface TextFieldProps extends AriaAttributes {
  /** TextField checked state */
  checked: boolean;
  /** TextField onChange handler*/
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  /** The name attribute specifies the name of an input element.
     The name attribute is used to reference elements in a JavaScript,
     or to reference form data after a form is submitted.
     Note: Only form elements with a name attribute will have their values passed when submitting a form. */
  name: string;
  /** The value attribute specifies the value of an input element. */
  value?: string;
  /** TextField label */
  label?: string;
  /** Is TextField disabled */
  disabled?: boolean;
  /** Is TextField indeterminate */
  readonly?: boolean;
  error?: {message: string; hasError: boolean};
  /** Size of TextField */
  size?: ComponentSizeXSToL;
}

/**
 * ### Production-ready Checklist:
 * * (?) implementation of component approved by design team;
 * * (?) has storybook, covered with stories and documentation;
 * * (?) has tests: test every prop, every state and every interaction that's js related;
 * * (see apps/test/unit/componentLibrary/TextFieldTest.jsx)
 * * (?) passes accessibility checks;
 *
 * ###  Status: ```WIP```
 *
 * Design System: TextField Component.
 * Used to render a text field.
 */
const TextField: React.FunctionComponent<TextFieldProps> = ({
  label,
  checked,
  onChange,
  name,
  value,
  disabled = false,
  readonly = false,
  error,
  size = 'm',
  ...rest
}) => {
  const bodyTextSize = componentSizeToBodyTextSizeMap[size];

  return (
    <label
      className={classnames(moduleStyles.label, moduleStyles[`label-${size}`])}
      aria-describedby={rest['aria-describedby']}
    >
      {label && (
        <Typography semanticTag="span" visualAppearance={bodyTextSize}>
          {label}
        </Typography>
      )}
      <input
        type="text"
        name={name}
        value={value}
        disabled={disabled}
        onChange={onChange}
      />
    </label>
  );
};

export default TextField;
