import classNames from 'classnames';
import {ReactNode, useMemo, HTMLAttributes} from 'react';

import {ComponentSizeXSToL} from '@/common/types';
import FontAwesomeV6Icon, {FontAwesomeV6IconProps} from '@/fontAwesomeV6Icon';

import moduleStyles from './formFieldWrapper.module.scss';

export interface FormFieldWrapperProps extends HTMLAttributes<HTMLDivElement> {
  /** FormFieldWrapper children */
  children?: ReactNode;
  /** FormFieldWrapper color */
  color?: 'black' | 'gray' | 'white';
  /** FormFieldWrapper size */
  size?: Exclude<ComponentSizeXSToL, 'xs'>;
  /** FormFieldWrapper label */
  label?: ReactNode;
  /** FormFieldWrapper helper section */
  helper?: Partial<{
    icon: FontAwesomeV6IconProps;
    text: ReactNode;
  }>;
  /** FormFieldWrapper error message */
  error?: ReactNode;
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
  label,
  error,
  helper,
  color = 'black',
  size = 'm',
  ...HTMLAttributes
}) => {
  const errorSection = useMemo(
    () =>
      error && (
        <div
          className={classNames(
            moduleStyles.formFieldWrapperHelper,
            moduleStyles.formFieldWrapperError,
          )}
        >
          <FontAwesomeV6Icon iconName="circle-exclamation" />
          <span>{error}</span>
        </div>
      ),
    [error],
  );

  const helperSection = useMemo(
    () =>
      (helper?.icon || helper?.text) && (
        <div className={moduleStyles.formFieldWrapperHelper}>
          {helper?.icon && <FontAwesomeV6Icon {...helper.icon} />}
          {helper?.text && <span>{helper.text}</span>}
        </div>
      ),
    [helper],
  );

  return (
    <div
      {...HTMLAttributes}
      className={classNames(
        moduleStyles.formFieldWrapper,
        moduleStyles[`formFieldWrapper-${color}`],
        moduleStyles[`formFieldWrapper-${size}`],
        HTMLAttributes.className,
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
