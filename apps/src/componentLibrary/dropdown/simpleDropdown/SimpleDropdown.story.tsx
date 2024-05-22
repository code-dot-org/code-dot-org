import {Meta, StoryFn} from '@storybook/react';
import React, {useState} from 'react';

import {
  SimpleDropdown,
  SimpleDropdownProps,
} from '@cdo/apps/componentLibrary/dropdown';

export default {
  title: 'DesignSystem/Dropdown/Simple Dropdown', // eslint-disable-line storybook/no-title-property-in-meta
  component: SimpleDropdown,
} as Meta;

//
// TEMPLATE
//
// This is needed to fix children type error (passing string instead of React.ReactNode type)
// eslint-disable-next-line
const SingleTemplate: StoryFn<SimpleDropdownProps> = args => {
  const [value, setValues] = useState('');
  return (
    <SimpleDropdown
      {...args}
      selectedValue={value || args.selectedValue}
      onChange={e => {
        setValues(e.target.value);
        args.onChange(e);
      }}
    />
  );
};

const MultipleTemplate: StoryFn<{
  components: SimpleDropdownProps[];
}> = args => {
  const [values, setValues] = useState({} as Record<string, string>);

  return (
    <>
      <p>
        * Margins on this screen does not represent Component's margins, and are
        only added to improve storybook view *
      </p>
      <p>Multiple Dropdowns:</p>
      <div style={{display: 'flex', gap: '20px'}}>
        {args.components?.map(componentArg => (
          <SimpleDropdown
            key={componentArg.name}
            {...componentArg}
            selectedValue={
              values[componentArg.name] || componentArg.selectedValue
            }
            onChange={e => {
              setValues({
                ...values,
                [componentArg.name]: e.target.value,
              });
              componentArg.onChange(e);
            }}
          />
        ))}
      </div>
    </>
  );
};

export const DefaultDropdown = SingleTemplate.bind({});
DefaultDropdown.args = {
  name: 'default-dropdown',
  items: [
    {value: 'option-1', text: 'Option 1'},
    {value: 'option-2', text: 'Option 2'},
  ],
  labelText: 'Default Dropdown',
  isLabelVisible: false,
  selectedValue: 'option-1',
  onChange: args => console.log(args, args.target.value),
  size: 'm',
};

export const DisabledDropdown = SingleTemplate.bind({});
DisabledDropdown.args = {
  name: 'disabled-dropdown',
  items: [
    {value: 'option-1', text: 'Option 1'},
    {value: 'option-2', text: 'Option 2'},
  ],
  selectedValue: 'option-1',
  labelText: 'Disabled Dropdown',
  onChange: args => console.log(args),
  disabled: true,
  size: 'm',
};

export const GroupedOptionsDropdown = SingleTemplate.bind({});
GroupedOptionsDropdown.args = {
  name: 'grouped-options-dropdown',
  itemGroups: [
    {
      label: 'Group 1',
      groupItems: [
        {value: 'option-1', text: 'Option 1'},
        {value: 'option-2', text: 'Option 2'},
      ],
    },
    {label: 'Group 2', groupItems: [{value: 'option-3', text: 'Option 3'}]},
  ],
  labelText: 'Grouped Options Dropdown',
  isLabelVisible: false,
  selectedValue: 'option-1',
  onChange: args => console.log(args, args.target.value),
  size: 'm',
};

export const ThickAndThinDropdowns = MultipleTemplate.bind({});
ThickAndThinDropdowns.args = {
  components: [
    {
      name: 'default-dropdown-white',
      items: [
        {value: 'option-1', text: 'Option 1'},
        {value: 'option-2', text: 'Option 2'},
      ],
      selectedValue: 'option-1',
      labelText: 'Thick Dropdown',
      dropdownTextThickness: 'thick',
      onChange: args => console.log(args),
      size: 'm',
    },
    {
      name: 'default-dropdown-black',
      items: [
        {value: 'option-1', text: 'Option 1'},
        {value: 'option-2', text: 'Option 2'},
      ],
      selectedValue: 'option-1',
      labelText: 'Thin Dropdown',
      dropdownTextThickness: 'thin',
      onChange: args => console.log(args),
      size: 'm',
    },
  ],
};

export const GroupOfDropdownColors = MultipleTemplate.bind({});
GroupOfDropdownColors.args = {
  components: [
    {
      name: 'default-dropdown-white',
      items: [
        {value: 'option-1', text: 'Option 1'},
        {value: 'option-2', text: 'Option 2'},
      ],
      selectedValue: 'option-1',
      labelText: 'White Dropdown',
      onChange: args => console.log(args),
      size: 'm',
      color: 'white',
    },
    {
      name: 'default-dropdown-black',
      items: [
        {value: 'option-1', text: 'Option 1'},
        {value: 'option-2', text: 'Option 2'},
      ],
      selectedValue: 'option-1',
      labelText: 'Black Dropdown',
      onChange: args => console.log(args),
      size: 'm',
      color: 'black',
    },
    {
      name: 'default-dropdown-gray',
      items: [
        {value: 'option-1', text: 'Option 1'},
        {value: 'option-2', text: 'Option 2'},
      ],
      selectedValue: 'option-1',
      labelText: 'Gray Dropdown',
      onChange: args => console.log(args),
      size: 'm',
      color: 'gray',
    },
  ],
};
export const GroupOfSizesOfDropdown = MultipleTemplate.bind({});
GroupOfSizesOfDropdown.args = {
  components: [
    {
      name: 'default-dropdown-xs',
      items: [
        {value: 'option-1', text: 'Option 1'},
        {value: 'option-2', text: 'Option 2'},
      ],
      selectedValue: 'option-1',
      labelText: 'XS Dropdown',
      onChange: args => console.log(args),
      size: 'xs',
    },
    {
      name: 'default-dropdown-s',
      items: [
        {value: 'option-1', text: 'Option 1'},
        {value: 'option-2', text: 'Option 2'},
      ],
      selectedValue: 'option-1',
      labelText: 'S Dropdown',
      onChange: args => console.log(args),
      size: 's',
    },
    {
      name: 'default-dropdown-m',
      items: [
        {value: 'option-1', text: 'Option 1'},
        {value: 'option-2', text: 'Option 2'},
      ],
      selectedValue: 'option-1',
      labelText: 'M Dropdown',
      onChange: args => console.log(args),
      size: 'm',
    },
    {
      name: 'default-dropdown-white',
      items: [
        {value: 'option-1', text: 'Option 1'},
        {value: 'option-2', text: 'Option 2'},
      ],
      selectedValue: 'option-1',
      labelText: 'L Dropdown',
      onChange: args => console.log(args),
      size: 'l',
    },
  ],
};
