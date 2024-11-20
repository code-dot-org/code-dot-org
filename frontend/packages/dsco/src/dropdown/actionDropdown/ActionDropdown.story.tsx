import {Meta, StoryFn} from '@storybook/react';
import React from 'react';

import ActionDropdown, {ActionDropdownProps} from './index';

export default {
  title: 'DesignSystem/Dropdown/Action Dropdown', // eslint-disable-line storybook/no-title-property-in-meta
  component: ActionDropdown.type,
} as Meta;

//
// TEMPLATE
//
const SingleTemplate: StoryFn<ActionDropdownProps> = args => {
  return <ActionDropdown {...args} />;
};

const MultipleTemplate: StoryFn<{
  components: ActionDropdownProps[];
}> = args => {
  return (
    <>
      <p>
        * Margins on this screen does not represent Component's margins, and are
        only added to improve storybook view *
      </p>
      <p>Multiple Dropdown:</p>
      <div style={{display: 'flex', gap: '20px'}}>
        {args.components?.map(componentArg => {
          return (
            <ActionDropdown key={`${componentArg.name}`} {...componentArg} />
          );
        })}
      </div>
    </>
  );
};

export const DefaultActionDropdown = SingleTemplate.bind({});
DefaultActionDropdown.args = {
  name: 'default-dropdown',
  triggerButtonProps: {
    color: 'purple',
    type: 'primary',
    isIconOnly: true,
    icon: {iconName: 'smile', iconStyle: 'solid'},
  },
  options: [
    {
      value: 'option-1',
      label: 'Option 1',
      icon: {iconName: 'check', iconStyle: 'solid'},
      onClick: () => console.log('option 1'),
    },
    {
      value: 'option-2',
      label: 'Option 2',
      icon: {iconName: 'xmark', iconStyle: 'solid'},
      onClick: () => console.log('option 2'),
    },
  ],
  labelText: 'Default Dropdown',
  disabled: false,
  size: 'm',
};

export const DisabledActionDropdown = SingleTemplate.bind({});
DisabledActionDropdown.args = {
  name: 'disabled-dropdown',
  triggerButtonProps: {
    color: 'purple',
    type: 'primary',
    isIconOnly: true,
    icon: {iconName: 'smile', iconStyle: 'solid'},
  },
  options: [
    {
      value: 'option-1',
      label: 'Option 1',
      icon: {iconName: 'check', iconStyle: 'solid'},
      onClick: () => null,
    },
    {
      value: 'option-2',
      label: 'Option 2',
      icon: {iconName: 'xmark', iconStyle: 'solid'},
      onClick: () => null,
    },
  ],
  labelText: 'Disabled Dropdown',
  disabled: true,
  size: 'm',
};

export const WithDisabledOptionActionDropdown = SingleTemplate.bind({});
WithDisabledOptionActionDropdown.args = {
  name: 'withDisabledOption-dropdown',
  triggerButtonProps: {
    color: 'purple',
    type: 'primary',
    isIconOnly: true,
    icon: {iconName: 'smile', iconStyle: 'solid'},
  },
  options: [
    {
      value: 'option-1',
      label: 'Option 1',
      icon: {iconName: 'check', iconStyle: 'solid'},
      onClick: () => null,
    },
    {
      isOptionDisabled: true,
      value: 'option-2',
      label: 'Option 2',
      icon: {iconName: 'xmark', iconStyle: 'solid'},
      onClick: () => null,
    },
    {
      value: 'option-3',
      label: 'Option 3',
      icon: {iconName: 'xmark', iconStyle: 'solid'},
      onClick: () => null,
    },
  ],
  disabled: false,
  labelText: 'Default Dropdown',
  size: 'm',
};

export const WithDestructiveOptionActionDropdown = SingleTemplate.bind({});
WithDestructiveOptionActionDropdown.args = {
  name: 'withDisabledOption-dropdown',
  triggerButtonProps: {
    color: 'purple',
    type: 'primary',
    isIconOnly: true,
    icon: {iconName: 'smile', iconStyle: 'solid'},
  },
  options: [
    {
      value: 'option-1',
      label: 'Option 1',
      icon: {iconName: 'check', iconStyle: 'solid'},
      onClick: () => null,
    },
    {
      isOptionDestructive: true,
      value: 'option-2',
      label: 'Option 2',
      icon: {iconName: 'xmark', iconStyle: 'solid'},
      onClick: () => null,
    },
    {
      value: 'option-3',
      label: 'Option 3',
      icon: {iconName: 'xmark', iconStyle: 'solid'},
      onClick: () => null,
    },
  ],
  disabled: false,
  labelText: 'Default Dropdown',
  size: 'm',
};

export const GroupOfActionDropdownColors = MultipleTemplate.bind({});
GroupOfActionDropdownColors.args = {
  components: [
    {
      name: 'default-dropdown-light',
      triggerButtonProps: {
        color: 'purple',
        type: 'primary',
        isIconOnly: true,
        icon: {iconName: 'smile', iconStyle: 'solid'},
      },
      options: [
        {
          value: 'option-1',
          label: 'Option 1',
          icon: {iconName: 'check', iconStyle: 'solid'},
          onClick: () => null,
        },
        {
          value: 'option-2',
          label: 'Option 2',
          icon: {iconName: 'xmark', iconStyle: 'solid'},
          onClick: () => null,
        },
      ],
      labelText: 'Light Dropdown',
      size: 'm',
      disabled: false,
    },
    {
      name: 'default-dropdown-dark',
      triggerButtonProps: {
        color: 'white',
        type: 'primary',
        isIconOnly: true,
        icon: {iconName: 'smile', iconStyle: 'solid'},
      },
      options: [
        {
          value: 'option-1',
          label: 'Option 1',
          icon: {iconName: 'check', iconStyle: 'solid'},
          onClick: () => null,
        },
        {
          value: 'option-2',
          label: 'Option 2',
          icon: {iconName: 'xmark', iconStyle: 'solid'},
          onClick: () => null,
        },
      ],
      labelText: 'Black Dropdown',
      size: 'm',
      disabled: false,
    },
  ],
};

export const GroupOfActionDropdownMenuPlacements = MultipleTemplate.bind({});
GroupOfActionDropdownMenuPlacements.args = {
  components: [
    {
      name: 'default-dropdown-left',
      triggerButtonProps: {
        color: 'purple',
        type: 'primary',
        isIconOnly: true,
        icon: {iconName: 'smile', iconStyle: 'solid'},
      },
      options: [
        {
          value: 'option-1',
          label: 'Option 1',
          icon: {iconName: 'check', iconStyle: 'solid'},
          onClick: () => null,
        },
        {
          value: 'option-2',
          label: 'Option 2',
          icon: {iconName: 'xmark', iconStyle: 'solid'},
          onClick: () => null,
        },
      ],
      labelText: 'Light Dropdown',
      size: 'm',
      menuPlacement: 'left',
    },
    {
      name: 'default-dropdown-right',
      triggerButtonProps: {
        color: 'purple',
        type: 'primary',
        isIconOnly: true,
        icon: {iconName: 'smile', iconStyle: 'solid'},
      },
      options: [
        {
          value: 'option-1',
          label: 'Option 1',
          icon: {iconName: 'check', iconStyle: 'solid'},
          onClick: () => null,
        },
        {
          value: 'option-2',
          label: 'Option 2',
          icon: {iconName: 'xmark', iconStyle: 'solid'},
          onClick: () => null,
        },
      ],
      labelText: 'Black Dropdown',
      size: 'm',
      menuPlacement: 'right',
    },
  ],
};

export const GroupOfSizesOfActionDropdown = MultipleTemplate.bind({});
GroupOfSizesOfActionDropdown.args = {
  components: [
    {
      name: 'default-dropdown-xs',
      triggerButtonProps: {
        color: 'purple',
        type: 'primary',
        isIconOnly: true,
        icon: {iconName: 'smile', iconStyle: 'solid'},
      },
      options: [
        {
          value: 'option-1',
          label: 'Option 1',
          icon: {iconName: 'check', iconStyle: 'solid'},
          onClick: () => null,
        },
        {
          value: 'option-2',
          label: 'Option 2',
          icon: {iconName: 'xmark', iconStyle: 'solid'},
          onClick: () => null,
        },
      ],
      labelText: 'XS Dropdown',
      size: 'xs',
      disabled: false,
    },
    {
      name: 'default-dropdown-s',
      triggerButtonProps: {
        color: 'purple',
        type: 'primary',
        isIconOnly: true,
        icon: {iconName: 'smile', iconStyle: 'solid'},
      },
      options: [
        {
          value: 'option-1',
          label: 'Option 1',
          icon: {iconName: 'check', iconStyle: 'solid'},
          onClick: () => null,
        },
        {
          value: 'option-2',
          label: 'Option 2',
          icon: {iconName: 'xmark', iconStyle: 'solid'},
          onClick: () => null,
        },
      ],
      labelText: 'S Dropdown',
      size: 's',
      disabled: false,
    },
    {
      name: 'default-dropdown-m',
      triggerButtonProps: {
        color: 'purple',
        type: 'primary',
        isIconOnly: true,
        icon: {iconName: 'smile', iconStyle: 'solid'},
      },
      options: [
        {
          value: 'option-1',
          label: 'Option 1',
          icon: {iconName: 'check', iconStyle: 'solid'},
          onClick: () => null,
        },
        {
          value: 'option-2',
          label: 'Option 2',
          icon: {iconName: 'xmark', iconStyle: 'solid'},
          onClick: () => null,
        },
      ],
      labelText: 'M Dropdown',
      size: 'm',
      disabled: false,
    },
    {
      name: 'default-dropdown-l',
      triggerButtonProps: {
        color: 'purple',
        type: 'primary',
        isIconOnly: true,
        icon: {iconName: 'smile', iconStyle: 'solid'},
      },
      options: [
        {
          value: 'option-1',
          label: 'Option 1',
          icon: {iconName: 'check', iconStyle: 'solid'},
          onClick: () => null,
        },
        {
          value: 'option-2',
          label: 'Option 2',
          icon: {iconName: 'xmark', iconStyle: 'solid'},
          onClick: () => null,
        },
      ],

      labelText: 'L Dropdown',
      size: 'l',
      disabled: false,
    },
  ],
};
