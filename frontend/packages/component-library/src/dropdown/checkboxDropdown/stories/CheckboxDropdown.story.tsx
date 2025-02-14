import {Meta, StoryFn} from '@storybook/react';
import React, {useState, useCallback} from 'react';

import {dropdownColors} from './../../index';

import CheckboxDropdown, {CheckboxDropdownProps} from '../index';

export default {
  title: 'DesignSystem/Dropdown/Checkbox Dropdown',
  component: CheckboxDropdown.type,
} as Meta;

//
// TEMPLATE
//
const SingleTemplate: StoryFn<CheckboxDropdownProps> = args => {
  const [selectedValues, setValues] = useState(args.checkedOptions as string[]);
  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.checked) {
        setValues([...selectedValues, e.target.value]);
      } else {
        setValues(selectedValues.filter(value => value !== e.target.value));
      }
      args.onChange(e);
    },
    [args, selectedValues, setValues],
  );
  const onSelectAll = useCallback(
    (
      e:
        | React.MouseEvent<HTMLButtonElement>
        | React.MouseEvent<HTMLAnchorElement>,
    ) => {
      setValues(args.allOptions.map(option => option.value));
      if (!args.hideControls) {
        args.onSelectAll(e);
      }
    },
    [args],
  );
  const onClearAll = useCallback(
    (
      e:
        | React.MouseEvent<HTMLButtonElement>
        | React.MouseEvent<HTMLAnchorElement>,
    ) => {
      setValues([]);
      if (!args.hideControls) {
        args.onClearAll(e);
      }
    },
    [args],
  );

  if (!args.hideControls) {
    return (
      <CheckboxDropdown
        {...args}
        checkedOptions={selectedValues}
        onChange={onChange}
        onSelectAll={onSelectAll}
        onClearAll={onClearAll}
        selectAllText="Select all"
        clearAllText="Clear all"
      />
    );
  } else {
    return (
      <CheckboxDropdown
        {...args}
        checkedOptions={selectedValues}
        onChange={onChange}
      />
    );
  }
};

const MultipleTemplate: StoryFn<{
  components: CheckboxDropdownProps[];
}> = args => {
  const [values, setValues] = useState({} as Record<string, string[]>);

  return (
    <>
      <p>
        * Margins on this screen does not represent Component's margins, and are
        only added to improve storybook view *
      </p>
      <p>Multiple Dropdown:</p>
      <div style={{display: 'flex', gap: '20px'}}>
        {args.components?.map(componentArg => {
          if (values[componentArg.name] === undefined) {
            setValues({
              ...values,
              [componentArg.name]: componentArg.checkedOptions,
            });
          }

          const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.checked) {
              setValues({
                ...values,
                [componentArg.name]: [
                  ...values[componentArg.name],
                  e.target.value,
                ],
              });
            } else {
              setValues({
                ...values,
                [componentArg.name]: values[componentArg.name].filter(
                  value => value !== e.target.value,
                ),
              });
            }
            componentArg.onChange(e);
          };
          const onSelectAll = (
            e:
              | React.MouseEvent<HTMLButtonElement>
              | React.MouseEvent<HTMLAnchorElement>,
          ) => {
            setValues({
              ...values,
              [componentArg.name]: componentArg.allOptions.map(
                option => option.value,
              ),
            });
            if (!componentArg.hideControls) {
              componentArg.onSelectAll(e);
            }
          };
          const onClearAll = (
            e:
              | React.MouseEvent<HTMLButtonElement>
              | React.MouseEvent<HTMLAnchorElement>,
          ) => {
            setValues({...values, [componentArg.name]: []});
            if (!componentArg.hideControls) {
              componentArg.onClearAll(e);
            }
          };

          if (!componentArg.hideControls) {
            return (
              <CheckboxDropdown
                key={`${componentArg.name}`}
                {...componentArg}
                checkedOptions={
                  values[componentArg.name] || componentArg.checkedOptions
                }
                onChange={onChange}
                onSelectAll={onSelectAll}
                onClearAll={onClearAll}
              />
            );
          } else {
            return (
              <CheckboxDropdown
                key={`${componentArg.name}`}
                {...componentArg}
                checkedOptions={
                  values[componentArg.name] || componentArg.checkedOptions
                }
                onChange={onChange}
              />
            );
          }
        })}
      </div>
    </>
  );
};

export const DefaultCheckboxDropdown = SingleTemplate.bind({});
DefaultCheckboxDropdown.args = {
  name: 'default-dropdown',
  allOptions: [
    {value: 'option-1', label: 'Option 1'},
    {value: 'option-2', label: 'Option 2'},
  ],
  labelText: 'Default Dropdown',
  checkedOptions: ['option-1'],
  disabled: false,
  color: dropdownColors.black,
  onChange: () => null,
  onSelectAll: () => null,
  onClearAll: () => null,
  size: 'm',
};

export const NoSelectOrClearAllCheckboxDropdown = SingleTemplate.bind({});
NoSelectOrClearAllCheckboxDropdown.args = {
  name: 'no-select-all-or-clear-all-dropdown',
  hideControls: true,
  allOptions: [
    {value: 'option-1', label: 'Option 1'},
    {value: 'option-2', label: 'Option 2'},
  ],
  labelText: 'No Select All or Clear All Dropdown',
  checkedOptions: ['option-1'],
  disabled: false,
  color: dropdownColors.black,
  onChange: () => null,
  size: 'm',
};

export const ReadOnlyCheckboxDropdown = SingleTemplate.bind({});
ReadOnlyCheckboxDropdown.args = {
  name: 'readOnly-dropdown',
  allOptions: [
    {value: 'option-1', label: 'Option 1'},
    {value: 'option-2', label: 'Option 2'},
  ],
  checkedOptions: ['option-1'],
  labelText: 'ReadOnly Dropdown',
  onChange: () => null,
  onSelectAll: () => null,
  onClearAll: () => null,
  readOnly: true,
  color: dropdownColors.black,
  size: 'm',
};

export const DisabledCheckboxDropdown = SingleTemplate.bind({});
DisabledCheckboxDropdown.args = {
  name: 'disabled-dropdown',
  allOptions: [
    {value: 'option-1', label: 'Option 1'},
    {value: 'option-2', label: 'Option 2'},
  ],
  checkedOptions: ['option-1'],
  labelText: 'Disabled Dropdown',
  onChange: () => null,
  onSelectAll: () => null,
  onClearAll: () => null,
  disabled: true,
  color: dropdownColors.black,
  size: 'm',
};

export const WithDisabledOptionCheckboxDropdown = SingleTemplate.bind({});
WithDisabledOptionCheckboxDropdown.args = {
  name: 'withDisabledOption-dropdown',
  allOptions: [
    {value: 'option-1', label: 'Option 1', isOptionDisabled: true},
    {value: 'option-2', label: 'Option 2'},
    {value: 'option-3', label: 'Option 3'},
  ],
  disabled: false,
  color: dropdownColors.black,
  checkedOptions: ['option-1'],
  labelText: 'Dropdown with disabled option',
  onChange: () => null,
  onSelectAll: () => null,
  onClearAll: () => null,
  size: 'm',
};

export const StyledAsFieldCheckboxDropdown = SingleTemplate.bind({});
StyledAsFieldCheckboxDropdown.args = {
  name: 'styled-as-field-checkbox-dropdown',
  allOptions: [
    {value: 'option-1', label: 'Option 1'},
    {value: 'option-2', label: 'Option 2'},
  ],
  checkedOptions: ['option-1'],
  labelText: 'Helper Message Checkbox Dropdown',
  onChange: args => console.log(args),
  helperMessage: 'Helper message',
  styleAsFormField: true,
  size: 'm',
};

export const WithErrorCheckboxDropdown = SingleTemplate.bind({});
WithErrorCheckboxDropdown.args = {
  name: 'error-checkbox-dropdown',
  allOptions: [
    {value: 'option-1', label: 'Option 1'},
    {value: 'option-2', label: 'Option 2'},
  ],
  checkedOptions: ['option-1'],
  labelText: 'Error Checkbox Dropdown',
  onChange: args => console.log(args),
  errorMessage: 'Error message',
  size: 'm',
};

export const WithHelperMessageCheckboxDropdown = SingleTemplate.bind({});
WithHelperMessageCheckboxDropdown.args = {
  name: 'helper-message-checkbox-dropdown',
  allOptions: [
    {value: 'option-1', label: 'Option 1'},
    {value: 'option-2', label: 'Option 2'},
  ],
  checkedOptions: ['option-1'],
  labelText: 'Helper Message Checkbox Dropdown',
  onChange: args => console.log(args),
  helperMessage: 'Helper message',
  size: 'm',
};

export const WithHelperMessageAndIconCheckboxDropdown = SingleTemplate.bind({});
WithHelperMessageAndIconCheckboxDropdown.args = {
  name: 'helper-icon-checkbox-dropdown',
  allOptions: [
    {value: 'option-1', label: 'Option 1'},
    {value: 'option-2', label: 'Option 2'},
  ],
  checkedOptions: ['option-1'],
  labelText: 'Helper Icon Checkbox Dropdown',
  onChange: args => console.log(args),
  helperIcon: {
    iconName: 'info-circle',
  },
  helperMessage: 'Helper message',
  size: 'm',
};

export const ThickAndThinCheckboxDropdowns = MultipleTemplate.bind({});
ThickAndThinCheckboxDropdowns.args = {
  components: [
    {
      name: 'thick-dropdown',
      allOptions: [
        {value: 'option-1', label: 'Option 1'},
        {value: 'option-2', label: 'Option 2'},
      ],
      checkedOptions: ['option-1'],
      labelText: 'Thick Dropdown',
      labelType: 'thick',
      onChange: () => null,
      onSelectAll: () => null,
      onClearAll: () => null,
      selectAllText: 'Select All',
      clearAllText: 'Clear All',
      size: 'm',
      disabled: false,
    },
    {
      name: 'thin-dropdown',
      allOptions: [
        {value: 'option-1', label: 'Option 1'},
        {value: 'option-2', label: 'Option 2'},
      ],
      checkedOptions: ['option-1'],
      labelText: 'Thin Dropdown',
      labelType: 'thin',
      onChange: () => null,
      onSelectAll: () => null,
      onClearAll: () => null,
      selectAllText: 'Select All',
      clearAllText: 'Clear All',
      size: 'm',
      disabled: false,
    },
  ],
};

export const GroupOfCheckboxDropdownColors = MultipleTemplate.bind({});
GroupOfCheckboxDropdownColors.args = {
  components: [
    {
      name: 'default-dropdown-white',
      allOptions: [
        {value: 'option-1', label: 'Option 1'},
        {value: 'option-2', label: 'Option 2'},
      ],
      checkedOptions: ['option-1'],
      labelText: 'White Dropdown',
      onChange: () => null,
      onSelectAll: () => null,
      onClearAll: () => null,
      selectAllText: 'Select All',
      clearAllText: 'Clear All',
      size: 'm',
      disabled: false,
      color: dropdownColors.white,
    },
    {
      name: 'default-dropdown-black',
      allOptions: [
        {value: 'option-1', label: 'Option 1'},
        {value: 'option-2', label: 'Option 2'},
      ],
      checkedOptions: ['option-1'],
      labelText: 'Black Dropdown',
      onChange: () => null,
      onSelectAll: () => null,
      onClearAll: () => null,
      selectAllText: 'Select All',
      clearAllText: 'Clear All',
      size: 'm',
      color: dropdownColors.black,
      disabled: false,
    },
    {
      name: 'default-dropdown-gray',
      allOptions: [
        {value: 'option-1', label: 'Option 1'},
        {value: 'option-2', label: 'Option 2'},
      ],
      checkedOptions: ['option-1'],
      labelText: 'Gray Dropdown',
      onChange: () => null,
      onSelectAll: () => null,
      onClearAll: () => null,
      selectAllText: 'Select All',
      clearAllText: 'Clear All',
      size: 'm',
      color: dropdownColors.gray,
      disabled: false,
    },
  ],
};

export const GroupOfSizesOfCheckboxDropdown = MultipleTemplate.bind({});
GroupOfSizesOfCheckboxDropdown.args = {
  components: [
    {
      name: 'default-dropdown-xs',
      allOptions: [
        {value: 'option-1', label: 'Option 1'},
        {value: 'option-2', label: 'Option 2'},
      ],
      checkedOptions: ['option-1'],
      labelText: 'XS Dropdown',
      onChange: () => null,
      onSelectAll: () => null,
      onClearAll: () => null,
      selectAllText: 'Select All',
      clearAllText: 'Clear All',
      size: 'xs',
      disabled: false,
      color: dropdownColors.black,
    },
    {
      name: 'default-dropdown-s',
      allOptions: [
        {value: 'option-1', label: 'Option 1'},
        {value: 'option-2', label: 'Option 2'},
      ],
      checkedOptions: ['option-1'],
      labelText: 'S Dropdown',
      onChange: () => null,
      onSelectAll: () => null,
      onClearAll: () => null,
      selectAllText: 'Select All',
      clearAllText: 'Clear All',
      size: 's',
      disabled: false,
      color: dropdownColors.black,
    },
    {
      name: 'default-dropdown-m',
      allOptions: [
        {value: 'option-1', label: 'Option 1'},
        {value: 'option-2', label: 'Option 2'},
      ],
      checkedOptions: ['option-1'],
      labelText: 'M Dropdown',
      onChange: () => null,
      onSelectAll: () => null,
      onClearAll: () => null,
      selectAllText: 'Select All',
      clearAllText: 'Clear All',
      size: 'm',
      disabled: false,
      color: dropdownColors.black,
    },
    {
      name: 'default-dropdown-white',
      allOptions: [
        {value: 'option-1', label: 'Option 1'},
        {value: 'option-2', label: 'Option 2'},
      ],
      checkedOptions: ['option-1'],
      labelText: 'L Dropdown',
      onChange: () => null,
      onSelectAll: () => null,
      onClearAll: () => null,
      selectAllText: 'Select All',
      clearAllText: 'Clear All',
      size: 'l',
      disabled: false,
      color: dropdownColors.black,
    },
  ],
};
