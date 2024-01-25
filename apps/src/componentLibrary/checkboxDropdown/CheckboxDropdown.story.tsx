import React, {useState, useCallback} from 'react';
import CheckboxDropdown, {CheckboxDropdownProps} from './index';
import {Meta, Story} from '@storybook/react';

export default {
  title: 'DesignSystem/Checkbox Dropdown Component',
  component: CheckboxDropdown,
} as Meta;

//
// TEMPLATE
//
// This is needed to fix children type error (passing string instead of React.ReactNode type)
// eslint-disable-next-line
const SingleTemplate: Story<CheckboxDropdownProps> = args => {
  const [selectedValues, setValues] = useState(
    (args.checkedOptions = [] as string[])
  );
  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      // e.stopPropagation();
      // e.preventDefault();
      console.log(e);
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

const MultipleTemplate: Story<{
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
            // e.stopPropagation();
            console.log(e);
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

          return componentArg.color === 'white' ? (
            <div style={{background: 'black', padding: 10}}>
              <CheckboxDropdown
                key={`${componentArg.name}`}
                {...componentArg}
                checkedOptions={values[componentArg.name]}
                onChange={onChange}
                onSelectAll={onSelectAll}
                onClearAll={onClearAll}
              />
            </div>
          ) : (
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
  onChange: args => console.log(args, args.target.value),
  onSelectAll: args => console.log(args),
  onClearAll: args => console.log(args),
  size: 'm',
};

export const DisabledCheckboxDropdown = SingleTemplate.bind({});
DisabledCheckboxDropdown.args = {
  name: 'default-dropdown',
  allOptions: [
    {value: 'option-1', label: 'Option 1'},
    {value: 'option-2', label: 'Option 2'},
  ],
  checkedOptions: ['option-1'],
  labelText: 'Disabled Dropdown',
  onChange: args => console.log(args),
  onSelectAll: args => console.log(args),
  onClearAll: args => console.log(args),
  disabled: true,
  size: 'm',
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
      onChange: args => console.log(args),
      onSelectAll: args => console.log(args),
      onClearAll: args => console.log(args),
      size: 'm',
      color: 'white',
    },
    {
      name: 'default-dropdown-black',
      allOptions: [
        {value: 'option-1', label: 'Option 1'},
        {value: 'option-2', label: 'Option 2'},
      ],
      checkedOptions: ['option-1'],
      labelText: 'Black Dropdown',
      onChange: args => console.log(args),
      onSelectAll: args => console.log(args),
      onClearAll: args => console.log(args),
      size: 'm',
      color: 'black',
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
      onChange: args => console.log(args),
      onSelectAll: args => console.log(args),
      onClearAll: args => console.log(args),
      size: 'xs',
    },
    {
      name: 'default-dropdown-s',
      allOptions: [
        {value: 'option-1', label: 'Option 1'},
        {value: 'option-2', label: 'Option 2'},
      ],
      checkedOptions: ['option-1'],
      labelText: 'S Dropdown',
      onChange: args => console.log(args),
      onSelectAll: args => console.log(args),
      onClearAll: args => console.log(args),
      size: 's',
    },
    {
      name: 'default-dropdown-m',
      allOptions: [
        {value: 'option-1', label: 'Option 1'},
        {value: 'option-2', label: 'Option 2'},
      ],
      checkedOptions: ['option-1'],
      labelText: 'M Dropdown',
      onChange: args => console.log(args),
      onSelectAll: args => console.log(args),
      onClearAll: args => console.log(args),
      size: 'm',
    },
    {
      name: 'default-dropdown-white',
      allOptions: [
        {value: 'option-1', label: 'Option 1'},
        {value: 'option-2', label: 'Option 2'},
      ],
      checkedOptions: ['option-1'],
      labelText: 'L Dropdown',
      onChange: args => console.log(args),
      onSelectAll: args => console.log(args),
      onClearAll: args => console.log(args),
      size: 'l',
    },
  ],
};
