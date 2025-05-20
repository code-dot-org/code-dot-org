import classNames from 'classnames';
import {ReactNode, LabelHTMLAttributes} from 'react';

import {ComponentSizeXSToL} from '@/common/types';
import FontAwesomeV6Icon, {FontAwesomeV6IconProps} from '@/fontAwesomeV6Icon';

import moduleStyles from './formFieldWrapper.module.scss';

export interface FormFieldWrapperProps
  extends LabelHTMLAttributes<HTMLLabelElement> {
  /** FormFieldWrapper children */
  children?: ReactNode;
  /** FormFieldWrapper Custom class name */
  className?: string;
  /** FormFieldWrapper color */
  color?: 'black' | 'gray' | 'white';
  /** FormFieldWrapper size */
  size?: Exclude<ComponentSizeXSToL, 'xs'>;
  /** FormFieldWrapper label */
  label?: string | ReactNode;
  /** FormFieldWrapper helper message */
  helperMessage?: string;
  /** FormFieldWrapper helper icon */
  helperIcon?: FontAwesomeV6IconProps;
  /** FormFieldWrapper error message */
  errorMessage?: string;
}

/**
 * ### Production-ready Checklist:
 * * (✔) implementation of component approved by design team;
 * * (✔) has storybook, covered with stories and documentation;
 * * (✔) has tests: test every prop, every state and every interaction that's js related;
 * * (see ./__tests__/FormFieldWrapper.test.tsx)
 * * (?) passes accessibility checks;
 *
 * ###  Status: ```Ready for dev```
 *
 * Design System: FormFieldWrapper Component.
 * Used to render a field label.
 */
const FormFieldWrapper: React.FunctionComponent<FormFieldWrapperProps> = ({
  children,
  className,
  label,
  helperMessage,
  helperIcon,
  errorMessage,
  color = 'black',
  size = 'm',
  ...HTMLAttributes
}) => (
  <label
    className={classNames(
      moduleStyles.formFieldWrapper,
      moduleStyles[`formFieldWrapper-color-${color}`],
      moduleStyles[`formFieldWrapper-size-${size}`],
      className,
    )}
    {...HTMLAttributes}
  >
    {label && (
      <span className={moduleStyles.formFieldWrapperLabel}>{label}</span>
    )}

    {children}

    {!errorMessage && helperMessage && (
      <div className={moduleStyles.formFieldWrapperHelper}>
        {helperIcon && <FontAwesomeV6Icon {...helperIcon} />}
        {<span>{helperMessage}</span>}
      </div>
    )}

    {errorMessage && (
      <div
        className={classNames(
          moduleStyles.formFieldWrapperHelper,
          moduleStyles.formFieldWrapperError,
        )}
      >
        <FontAwesomeV6Icon iconName="circle-exclamation" />
        <span>{errorMessage}</span>
      </div>
    )}
  </label>
);

export default FormFieldWrapper;
