import React, {useState, useCallback} from 'react';

import RadioButton, {RadioButtonProps} from './RadioButton';

// We then pass onChange to higher level prop, so we won't need to specify onChange for every radio button.
// checked value will be calculated in RadioButtonsGroup component.
type GroupedRadioButtonProps = Omit<RadioButtonProps, 'onChange' | 'checked'>;

export interface RadioButtonsGroupProps {
  /** Array of props for radio button to render */
  radioButtons: GroupedRadioButtonProps[];
  /** Custom/additional onChange handler */
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Default selected value */
  defaultValue?: string;
}

/**
 * Design System: Radio Button Group Component. (Created only as a shortcut for creating a group of Radio Buttons
 * Can be used to render a group of Radio Buttons or as a part of bigger/more complex components (e.g. Radio Button Group).
 */
const RadioButtonsGroup: React.FC<RadioButtonsGroupProps> = ({
  radioButtons,
  defaultValue = '',
  onChange,
}) => {
  const [selectedValue, setSelectedValue] = useState(defaultValue);
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSelectedValue(event.target.value);
      if (onChange) {
        onChange(event);
      }
    },
    [setSelectedValue, onChange]
  );

  const isSelectedButton = useCallback(
    (value: string) => value === selectedValue,
    [selectedValue]
  );

  return (
    <>
      {radioButtons.map(radioButtonProps => (
        <RadioButton
          key={radioButtonProps.value}
          {...radioButtonProps}
          onChange={handleChange}
          checked={isSelectedButton(radioButtonProps.value)}
        />
      ))}
    </>
  );
};

export default RadioButtonsGroup;
