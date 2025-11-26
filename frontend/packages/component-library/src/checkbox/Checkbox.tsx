import classnames from 'classnames';
import {
  memo,
  useRef,
  useEffect,
  ReactNode,
  ChangeEvent,
  InputHTMLAttributes,
} from 'react';

import {componentSizeToBodyTextSizeMap} from '@/common/constants';
import {ComponentSizeXSToL} from '@/common/types';
import Typography from '@/typography';

import moduleStyles from './checkbox.module.scss';

export interface CheckboxProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'size' | 'type' | 'onChange' | 'checked' | 'name' | 'value'
  > {
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
  label?: string | ReactNode;
  /** Is checkbox disabled */
  disabled?: boolean;
  /** Is checkbox indeterminate */
  indeterminate?: boolean;
  /** Size of checkbox */
  size?: ComponentSizeXSToL;
  /** Text thickness styling */
  textThickness?: 'thick' | 'thin';
  /** Optional aria-label for the checkbox input (consistency with Button/Radio) */
  ariaLabel?: string;
  /** Custom className for the outer label */
  className?: string;
  /** Children (Checkbox custom content) */
  children?: React.ReactNode;
}

/**
 * ### Production-ready Checklist:
 * * (✔) implementation of component approved by design team;
 * * (✔) has storybook, covered with stories and documentation;
 * * (✔) has tests: test every prop, every state and every interaction that's js related;
 * * (see ./__tests__/Checkbox.test.tsx)
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
  textThickness = 'thin',
  ariaLabel,
  className,
  children,
  ...HTMLAttributes
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
      className={classnames(
        moduleStyles.label,
        moduleStyles[`label-${size}`],
        className,
      )}
    >
      <input
        type="checkbox"
        ref={checkboxRef}
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        {...HTMLAttributes}
        className={className}
        aria-label={ariaLabel ?? HTMLAttributes['aria-label']}
        aria-checked={indeterminate ? 'mixed' : undefined}
      />
      <i className="fa-solid" />
      {label && (
        <Typography
          semanticTag="span"
          className={classnames(
            moduleStyles.checkboxLabel,
            moduleStyles[`checkboxLabel-${textThickness}`],
          )}
          visualAppearance={bodyTextSize}
          noMargin
        >
          {label}
        </Typography>
      )}
      {children}
    </label>
  );
};

export default memo(Checkbox);
