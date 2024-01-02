import React from 'react';
import DropdownMenu, {DropdownMenuProps} from './index';
import {Meta, Story} from '@storybook/react';

export default {
  title: 'DesignSystem/Dropdown Menu Component',
  component: DropdownMenu,
} as Meta;

//
// TEMPLATE
//
// This is needed to fix children type error (passing string instead of React.ReactNode type)
// eslint-disable-next-line
const SingleTemplate: Story<DropdownMenuProps> = args => (
  <DropdownMenu {...args} />
);

const MultipleTemplate: Story<{
  components: DropdownMenuProps[];
}> = args => (
  <>
    <p>
      * Margins on this screen does not represent Component's margins, and are
      only added to improve storybook view *{' '}
    </p>
    <p>Multiple Dropdown:</p>
    <div style={{display: 'flex', gap: '20px'}}>
      {args.components?.map(componentArg => (
        <DropdownMenu key={`${componentArg.name}`} {...componentArg} />
      ))}
    </div>
  </>
);

export const DefaultDropdown = SingleTemplate.bind({});
DefaultDropdown.args = {
  name: 'default-dropdown',
  items: [
    {value: 'option-1', label: 'Option 1'},
    {value: 'option-2', label: 'Option 2'},
  ],
  onChange: args => console.log(args),
  size: 'm',
};

export const DisabledDropdown = SingleTemplate.bind({});
DisabledDropdown.args = {
  name: 'default-dropdown',
  items: [
    {value: 'option-1', label: 'Option 1'},
    {value: 'option-2', label: 'Option 2'},
  ],
  onChange: args => console.log(args),
  disabled: true,
  size: 'm',
};

export const GroupOfDropdownColors = MultipleTemplate.bind({});
GroupOfDropdownColors.args = {
  components: [
    {
      name: 'default-dropdown-white',
      items: [
        {value: 'option-1', label: 'Option 1'},
        {value: 'option-2', label: 'Option 2'},
      ],
      onChange: args => console.log(args),
      size: 'm',
      color: 'white',
    },
    {
      name: 'default-dropdown-black',
      items: [
        {value: 'option-1', label: 'Option 1'},
        {value: 'option-2', label: 'Option 2'},
      ],
      onChange: args => console.log(args),
      size: 'm',
      color: 'black',
    },
  ],
};
export const GroupOfSizesOfDropdown = MultipleTemplate.bind({});
GroupOfSizesOfDropdown.args = {
  components: [
    {
      name: 'default-dropdown-white',
      items: [
        {value: 'option-1', label: 'Option 1'},
        {value: 'option-2', label: 'Option 2'},
      ],
      onChange: args => console.log(args),
      size: 'xs',
    },
    {
      name: 'default-dropdown-white',
      items: [
        {value: 'option-1', label: 'Option 1'},
        {value: 'option-2', label: 'Option 2'},
      ],
      onChange: args => console.log(args),
      size: 's',
    },
    {
      name: 'default-dropdown-white',
      items: [
        {value: 'option-1', label: 'Option 1'},
        {value: 'option-2', label: 'Option 2'},
      ],
      onChange: args => console.log(args),
      size: 'm',
    },
    {
      name: 'default-dropdown-white',
      items: [
        {value: 'option-1', label: 'Option 1'},
        {value: 'option-2', label: 'Option 2'},
      ],
      onChange: args => console.log(args),
      size: 'l',
    },
  ],
};
