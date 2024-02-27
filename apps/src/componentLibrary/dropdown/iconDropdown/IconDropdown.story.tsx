import React, {useState, useCallback} from 'react';
import IconDropdown, {IconDropdownProps} from './index';
import {Meta, Story} from '@storybook/react';

import {dropdownColors} from '@cdo/apps/componentLibrary/dropdown';

export default {
  title: 'DesignSystem/Dropdown/Icon Dropdown', // eslint-disable-line storybook/no-title-property-in-meta
  component: IconDropdown,
} as Meta;

//
// TEMPLATE
//
const SingleTemplate: Story<IconDropdownProps> = args => {
  const [selectedValues, setValues] = useState(
    (args.checkedOptions = [] as string[])
  );
  const onChange = useCallback(
    (e: React.MouseEvent<HTMLLIElement>) => {
      // if (e.target.checked) {
      //   setValues([...selectedValues, e.target.value]);
      // } else {
      //   setValues(selectedValues.filter(value => value !== e.target.value));
      // }
      args.onChange(e);
    },
    [args, selectedValues, setValues]
  );

  return (
    <IconDropdown
      {...args}
      checkedOptions={selectedValues}
      onChange={onChange}
    />
  );
};

const MultipleTemplate: Story<{
  components: IconDropdownProps[];
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

          const onChange = (e: React.MouseEvent<HTMLLIElement>) => {
            // if (e.target.checked) {
            //   setValues({
            //     ...values,
            //     [componentArg.name]: [
            //       ...values[componentArg.name],
            //       e.target.value,
            //     ],
            //   });
            // } else {
            //   setValues({
            //     ...values,
            //     [componentArg.name]: values[componentArg.name].filter(
            //       value => value !== e.target.value
            //     ),
            //   });
            // }
            componentArg.onChange(e);
          };

          return componentArg.color === 'white' ? (
            <div style={{background: 'black', padding: 10}}>
              <IconDropdown
                key={`${componentArg.name}`}
                {...componentArg}
                checkedOptions={values[componentArg.name]}
                onChange={onChange}
              />
            </div>
          ) : (
            <IconDropdown
              key={`${componentArg.name}`}
              {...componentArg}
              checkedOptions={
                values[componentArg.name] || componentArg.checkedOptions
              }
              onChange={onChange}
            />
          );
        })}
      </div>
    </>
  );
};

export const DefaultIconDropdown = SingleTemplate.bind({});
DefaultIconDropdown.args = {
  name: 'default-dropdown',
  options: [
    {value: 'option-1', label: 'Option 1'},
    {value: 'option-2', label: 'Option 2'},
  ],
  labelText: 'Default Dropdown',
  checkedOptions: ['option-1'],
  disabled: false,
  color: dropdownColors.black,
  onChange: args => null,
  size: 'm',
};

export const DisabledIconDropdown = SingleTemplate.bind({});
DisabledIconDropdown.args = {
  name: 'default-dropdown',
  options: [
    {value: 'option-1', label: 'Option 1'},
    {value: 'option-2', label: 'Option 2'},
  ],
  checkedOptions: ['option-1'],
  labelText: 'Disabled Dropdown',
  onChange: args => null,
  disabled: true,
  color: dropdownColors.black,
  size: 'm',
};

export const WithDisabledOptionIconDropdown = SingleTemplate.bind({});
WithDisabledOptionIconDropdown.args = {
  name: 'default-dropdown',
  options: [
    {value: 'option-1', label: 'Option 1', isOptionDisabled: true},
    {value: 'option-2', label: 'Option 2'},
    {value: 'option-3', label: 'Option 3'},
  ],
  disabled: false,
  color: dropdownColors.black,
  checkedOptions: ['option-1'],
  labelText: 'Dropdown with disabled option',
  onChange: args => null,
  size: 'm',
};

export const GroupOfIconDropdownColors = MultipleTemplate.bind({});
GroupOfIconDropdownColors.args = {
  components: [
    {
      name: 'default-dropdown-white',
      options: [
        {value: 'option-1', label: 'Option 1'},
        {value: 'option-2', label: 'Option 2'},
      ],
      checkedOptions: ['option-1'],
      labelText: 'White Dropdown',
      onChange: args => null,
      size: 'm',
      disabled: false,
      color: dropdownColors.white,
    },
    {
      name: 'default-dropdown-black',
      options: [
        {value: 'option-1', label: 'Option 1'},
        {value: 'option-2', label: 'Option 2'},
      ],
      checkedOptions: ['option-1'],
      labelText: 'Black Dropdown',
      onChange: args => null,
      size: 'm',
      color: dropdownColors.black,
      disabled: false,
    },
  ],
};
export const GroupOfSizesOfIconDropdown = MultipleTemplate.bind({});
GroupOfSizesOfIconDropdown.args = {
  components: [
    {
      name: 'default-dropdown-xs',
      options: [
        {value: 'option-1', label: 'Option 1'},
        {value: 'option-2', label: 'Option 2'},
      ],
      checkedOptions: ['option-1'],
      labelText: 'XS Dropdown',
      onChange: args => null,
      size: 'xs',
      disabled: false,
      color: dropdownColors.black,
    },
    {
      name: 'default-dropdown-s',
      options: [
        {value: 'option-1', label: 'Option 1'},
        {value: 'option-2', label: 'Option 2'},
      ],
      checkedOptions: ['option-1'],
      labelText: 'S Dropdown',
      onChange: args => null,
      size: 's',
      disabled: false,
      color: dropdownColors.black,
    },
    {
      name: 'default-dropdown-m',
      options: [
        {value: 'option-1', label: 'Option 1'},
        {value: 'option-2', label: 'Option 2'},
      ],
      checkedOptions: ['option-1'],
      labelText: 'M Dropdown',
      onChange: args => null,
      size: 'm',
      disabled: false,
      color: dropdownColors.black,
    },
    {
      name: 'default-dropdown-white',
      options: [
        {value: 'option-1', label: 'Option 1'},
        {value: 'option-2', label: 'Option 2'},
      ],
      checkedOptions: ['option-1'],
      labelText: 'L Dropdown',
      onChange: args => null,
      size: 'l',
      disabled: false,
      color: dropdownColors.black,
    },
  ],
};
