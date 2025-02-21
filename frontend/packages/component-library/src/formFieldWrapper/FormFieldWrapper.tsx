import classNames from 'classnames';
import {ReactNode, useMemo, HTMLAttributes} from 'react';

import {ComponentSizeXSToL} from '@/common/types';
import FontAwesomeV6Icon, {FontAwesomeV6IconProps} from '@/fontAwesomeV6Icon';

import moduleStyles from './formFieldWrapper.module.scss';

export interface FormFieldWrapperProps extends HTMLAttributes<HTMLDivElement> {
  /** FormFieldWrapper children */
  children?: ReactNode;
  /** FormFieldWrapper Custom class name */
  className?: string;
  /** FormFieldWrapper color */
  color?: 'black' | 'gray' | 'white';
  /** FormFieldWrapper size */
  size?: Exclude<ComponentSizeXSToL, 'xs'>;
  /** FormFieldWrapper label */
  label?: ReactNode;
  /** FormFieldWrapper helper message */
  helperMessage?: ReactNode;
  /** FormFieldWrapper helper icon */
  helperIcon?: FontAwesomeV6IconProps;
  /** FormFieldWrapper error message */
  errorMessage?: ReactNode;
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
}) => {
  const errorSection = useMemo(
    () =>
      errorMessage && (
        <div
          className={classNames(
            moduleStyles.formFieldWrapperHelper,
            moduleStyles.formFieldWrapperError,
          )}
        >
          <FontAwesomeV6Icon iconName="circle-exclamation" />
          <span>{errorMessage}</span>
        </div>
      ),
    [errorMessage],
  );

  const helperSection = useMemo(
    () =>
      helperMessage && (
        <div className={moduleStyles.formFieldWrapperHelper}>
          {helperIcon && <FontAwesomeV6Icon {...helperIcon} />}
          {<span>{helperMessage}</span>}
        </div>
      ),
    [helperMessage, helperIcon],
  );

  return (
    <div
      {...HTMLAttributes}
      className={classNames(
        moduleStyles.formFieldWrapper,
        moduleStyles[`formFieldWrapper-color-${color}`],
        moduleStyles[`formFieldWrapper-size-${size}`],
        className,
      )}
    >
      {label ? (
        <label className={moduleStyles.formFieldWrapperLabel}>
          <span className={moduleStyles.formFieldWrapperLabelText}>
            {label}
          </span>
          {children}
        </label>
      ) : (
        children
      )}

      {errorSection || helperSection}
    </div>
  );
};

export default FormFieldWrapper;
