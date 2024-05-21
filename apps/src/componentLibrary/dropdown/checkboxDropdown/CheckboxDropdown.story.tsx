import {Meta, StoryFn} from '@storybook/react';
import React, {useState, useCallback} from 'react';

import {dropdownColors} from '@cdo/apps/componentLibrary/dropdown';

import CheckboxDropdown, {CheckboxDropdownProps} from './index';

export default {
  title: 'DesignSystem/Dropdown/Checkbox Dropdown', // eslint-disable-line storybook/no-title-property-in-meta
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
    [args, selectedValues, setValues]
  );
  const onSelectAll = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      setValues(args.allOptions.map(option => option.value));
      args.onSelectAll(e);
    },
    [args]
  );
  const onClearAll = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      setValues([]);
      args.onClearAll(e);
    },
    [args]
  );

  return (
    <CheckboxDropdown
      {...args}
      checkedOptions={selectedValues}
      onChange={onChange}
      onSelectAll={onSelectAll}
      onClearAll={onClearAll}
    />
  );
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
                  value => value !== e.target.value
                ),
              });
            }
            componentArg.onChange(e);
          };
          const onSelectAll = (e: React.MouseEvent<HTMLButtonElement>) => {
            setValues({
              ...values,
              [componentArg.name]: componentArg.allOptions.map(
                option => option.value
              ),
            });
            componentArg.onSelectAll(e);
          };
          const onClearAll = (e: React.MouseEvent<HTMLButtonElement>) => {
            setValues({...values, [componentArg.name]: []});
            componentArg.onClearAll(e);
          };

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
  onChange: args => null,
  onSelectAll: args => null,
  onClearAll: args => null,
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
  onChange: args => null,
  onSelectAll: args => null,
  onClearAll: args => null,
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
  onChange: args => null,
  onSelectAll: args => null,
  onClearAll: args => null,
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
      onChange: args => null,
      onSelectAll: args => null,
      onClearAll: args => null,
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
      onChange: args => null,
      onSelectAll: args => null,
      onClearAll: args => null,
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
      onChange: args => null,
      onSelectAll: args => null,
      onClearAll: args => null,
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
      onChange: args => null,
      onSelectAll: args => null,
      onClearAll: args => null,
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
      onChange: args => null,
      onSelectAll: args => null,
      onClearAll: args => null,
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
      onChange: args => null,
      onSelectAll: args => null,
      onClearAll: args => null,
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
      onChange: args => null,
      onSelectAll: args => null,
      onClearAll: args => null,
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
      onChange: args => null,
      onSelectAll: args => null,
      onClearAll: args => null,
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
      onChange: args => null,
      onSelectAll: args => null,
      onClearAll: args => null,
      size: 'l',
      disabled: false,
      color: dropdownColors.black,
    },
  ],
};
