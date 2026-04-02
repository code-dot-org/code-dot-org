import classnames from 'classnames';
import {memo, ChangeEvent, InputHTMLAttributes} from 'react';

import {componentSizeToBodyTextSizeMap} from '@/common/constants';
import {ComponentSizeXSToL} from '@/common/types';
import Typography from '@/typography';

import moduleStyles from './radioButton.module.scss';

export interface RadioButtonProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'size' | 'type' | 'onChange' | 'checked' | 'name' | 'value'
  > {
  /** Radio Button checked state */
  checked: boolean;
  /** Radio Button onChange handler*/
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  /** The name attribute specifies the name of an input element.
     The name attribute is used to reference elements in a JavaScript,
     or to reference form data after a form is submitted.
     Note: Only form elements with a name attribute will have their values passed when submitting a form. */
  name: string;
  /** The value attribute specifies the value of an input element. */
  value: string;
  /** Radio Button label */
  label?: string;
  /** Is Radio Button disabled */
  disabled?: boolean;
  /** Size of Radio Button */
  size?: ComponentSizeXSToL;
  /** Optional aria-label for the radio input (consistency with Button) */
  ariaLabel?: string;
  /** Text thickness styling */
  textThickness?: 'thick' | 'thin';
  /** Custom className */
  className?: string;
  /** Children (Radio Button custom content) */
  children?: React.ReactNode;
}

const RadioButton: React.FunctionComponent<RadioButtonProps> = ({
  label,
  checked,
  onChange,
  name,
  value,
  disabled = false,
  size = 'm',
  className,
  children,
  ariaLabel,
  textThickness = 'thin',
  ...HTMLAttributes
}) => {
  const bodyTextSize = componentSizeToBodyTextSizeMap[size];

  return (
    <label
      className={classnames(
        moduleStyles.radioButton,
        moduleStyles[`radioButton-${size}`],
        className,
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        aria-label={ariaLabel || HTMLAttributes['aria-label']}
        {...HTMLAttributes}
      />
      <i className={moduleStyles.radioIcon} />
      {label && (
        <Typography
          semanticTag="span"
          className={classnames(
            moduleStyles.radioButtonLabel,
            moduleStyles[`radioButtonLabel-${textThickness}`],
          )}
          visualAppearance={bodyTextSize}
          noMargin
        >
          {label}
        </Typography>
      )}
      {/** Custom content is rendered here if needed */}
      {children}
    </label>
  );
};

/**
 * ### Production-ready Checklist:
 * * (✔) implementation of component approved by design team;
 * * (✔) has storybook, covered with stories and documentation;
 * * (✔) has tests: test every prop, every state and every interaction that's js related;
 * * (see ./__tests__/RadioButton.test.tsx, ./__tests__/RadioButtonsGroup.test.tsx)
 * * (?) passes accessibility checks;
 *
 * ###  Status: ```Ready for dev```
 *
 * Design System: Radio Button Component.
 * Can be used to render a single Radio Button or as a part of bigger/more complex components (e.g. Radio Button Group).
 */
export default memo(RadioButton);
