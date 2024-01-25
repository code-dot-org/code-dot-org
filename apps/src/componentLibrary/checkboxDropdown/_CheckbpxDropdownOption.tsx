import React, {useMemo} from 'react';
import Checkbox from '@cdo/apps/componentLibrary/checkbox';

interface CheckboxDropdownOptionProps {
  value: string;
  label: string;
  checkedOptions: string[];
  onChange: (args: React.ChangeEvent<HTMLInputElement>) => void;
}

const CheckboxDropdownOption: React.FC<CheckboxDropdownOptionProps> = ({
  value,
  label,
  checkedOptions,
  onChange,
}) => {
  const isChecked = useMemo(() => {
    console.log(
      'CheckboxDropdownOption useMemo triggered',
      checkedOptions.includes(value),
      checkedOptions,
      value
    );
    return checkedOptions.includes(value);
  }, [checkedOptions, value]);

  return (
    <li key={value} className="checkbox form-group">
      <Checkbox
        checked={isChecked}
        onChange={onChange}
        name={value}
        value={value}
        label={label}
      />
    </li>
  );
};

export default CheckboxDropdownOption;
