import classNames from 'classnames';
import React, {ChangeEvent, AriaAttributes} from 'react';

import {getAriaPropsFromProps} from '@cdo/apps/componentLibrary/common/helpers';
import {ComponentSizeXSToL} from '@cdo/apps/componentLibrary/common/types';
import FontAwesomeV6Icon, {
  FontAwesomeV6IconProps,
} from '@cdo/apps/componentLibrary/fontAwesomeV6Icon';

import moduleStyles from './textfield.module.scss';

export interface TextFieldProps extends AriaAttributes {
  /** TextField onChange handler*/
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  /** TextField id */
  id?: string;
  /** The name attribute specifies the name of an input element.
     The name attribute is used to reference elements in a JavaScript,
     or to reference form data after a form is submitted.
     Note: Only form elements with a name attribute will have their values passed when submitting a form. */
  name: string;
  /** The value attribute specifies the value of an input element. */
  value?: string;
  /** TextField label */
  label?: string;
  /** TextField helper message */
  helperMessage?: string;
  /** TextField helper icon */
  helperIcon?: FontAwesomeV6IconProps;
  /** TextField placeholder */
  placeholder?: string;
  /** Is TextField readOnly */
  readOnly?: boolean;
  /** Is TextField disabled */
  disabled?: boolean;
  /** TextField error message */
  errorMessage?: string;
  /** TextField custom className */
  className?: string;
  /** TextField color */
  color?: 'black' | 'gray' | 'white';
  /** Size of TextField */
  size?: Exclude<ComponentSizeXSToL, 'xs'>;
}

/**
 * ### Production-ready Checklist:
 * * (✔) implementation of component approved by design team;
 * * (✔) has storybook, covered with stories and documentation;
 * * (✔) has tests: test every prop, every state and every interaction that's js related;
 * * (see apps/test/unit/componentLibrary/TextFieldTest.jsx)
 * * (?) passes accessibility checks;
 *
 * ###  Status: ```Ready for dev```
 *
 * Design System: TextField Component.
 * Used to render a text field.
 */
const TextField: React.FunctionComponent<TextFieldProps> = ({
  id,
  label,
  onChange,
  name,
  value,
  placeholder,
  disabled = false,
  readOnly = false,
  helperMessage,
  helperIcon,
  errorMessage,
  className,
  color = 'black',
  size = 'm',
  ...rest
}) => {
  const ariaProps = getAriaPropsFromProps(rest);

  return (
    <label
      className={classNames(
        moduleStyles.textField,
        moduleStyles[`textField-${color}`],
        moduleStyles[`textField-${size}`],
        className
      )}
      aria-describedby={rest['aria-describedby']}
    >
      {label && <span className={moduleStyles.textFieldLabel}>{label}</span>}
      <input
        id={id}
        type="text"
        name={name}
        value={value}
        placeholder={placeholder}
        readOnly={readOnly}
        disabled={disabled}
        onChange={onChange}
        {...ariaProps}
        aria-disabled={disabled || ariaProps['aria-disabled']}
      />
      {!errorMessage && (helperMessage || helperIcon) && (
        <div className={moduleStyles.textFieldHelperSection}>
          {helperIcon && <FontAwesomeV6Icon {...helperIcon} />}
          {helperMessage && <span>{helperMessage}</span>}
        </div>
      )}
      {errorMessage && (
        <div
          className={classNames(
            moduleStyles.textFieldHelperSection,
            moduleStyles.textFieldErrorSection
          )}
        >
          <FontAwesomeV6Icon iconName={'circle-exclamation'} />
          <span>{errorMessage}</span>
        </div>
      )}
    </label>
  );
};

export default TextField;
