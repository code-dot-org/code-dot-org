import {Meta, StoryFn} from '@storybook/react';
import React, {useState, useCallback} from 'react';

import {dropdownColors} from '@cdo/apps/componentLibrary/dropdown';

import IconDropdown, {IconDropdownProps, IconDropdownOption} from './index';

export default {
  title: 'DesignSystem/Dropdown/Icon Dropdown', // eslint-disable-line storybook/no-title-property-in-meta
  component: IconDropdown.type,
} as Meta;

//
// TEMPLATE
//
const SingleTemplate: StoryFn<IconDropdownProps> = args => {
  const [selectedValue, setValue] = useState(
    args.selectedOption as IconDropdownOption
  );
  const onChange = useCallback(
    (option: IconDropdownOption) => {
      setValue(option);
      args.onChange(option);
    },
    [args, setValue]
  );

  return (
    <IconDropdown
      {...args}
      selectedOption={selectedValue}
      onChange={onChange}
    />
  );
};

const MultipleTemplate: StoryFn<{
  components: IconDropdownProps[];
}> = args => {
  const [values, setValues] = useState(
    {} as Record<string, IconDropdownOption>
  );

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
              [componentArg.name]: componentArg.selectedOption,
            });
          }

          const onChange = (option: IconDropdownOption) => {
            setValues({
              ...values,
              [componentArg.name]: option,
            });
            componentArg.onChange(option);
          };

          return (
            <IconDropdown
              key={`${componentArg.name}`}
              {...componentArg}
              selectedOption={values[componentArg.name]}
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
    {
      value: 'option-1',
      label: 'Option 1',
      icon: {iconName: 'check', iconStyle: 'solid'},
    },
    {
      value: 'option-2',
      label: 'Option 2',
      icon: {iconName: 'xmark', iconStyle: 'solid'},
    },
  ],
  labelText: 'Default Dropdown',
  selectedOption: {
    value: 'option-1',
    label: 'Option 1',
    icon: {iconName: 'check', iconStyle: 'solid'},
  },
  disabled: false,
  color: dropdownColors.black,
  onChange: args => null,
  size: 'm',
};

export const DisabledIconDropdown = SingleTemplate.bind({});
DisabledIconDropdown.args = {
  name: 'disabled-dropdown',
  options: [
    {
      value: 'option-1',
      label: 'Option 1',
      icon: {iconName: 'check', iconStyle: 'solid'},
    },
    {
      value: 'option-2',
      label: 'Option 2',
      icon: {iconName: 'xmark', iconStyle: 'solid'},
    },
  ],
  selectedOption: {
    value: 'option-1',
    label: 'Option 1',
    icon: {iconName: 'check', iconStyle: 'solid'},
  },
  labelText: 'Disabled Dropdown',
  onChange: args => null,
  disabled: true,
  color: dropdownColors.black,
  size: 'm',
};

export const WithDisabledOptionIconDropdown = SingleTemplate.bind({});
WithDisabledOptionIconDropdown.args = {
  name: 'withDisabledOption-dropdown',
  options: [
    {
      value: 'option-1',
      label: 'Option 1',
      isOptionDisabled: true,
      icon: {iconName: 'xmark', iconStyle: 'solid'},
    },
    {
      value: 'option-2',
      label: 'Option 2',
      icon: {iconName: 'check', iconStyle: 'solid'},
    },
    {
      value: 'option-3',
      label: 'Option 3',
      icon: {iconName: 'check', iconStyle: 'solid'},
    },
  ],
  disabled: false,
  color: dropdownColors.black,
  selectedOption: {
    value: 'option-1',
    label: 'Option 1',
    icon: {iconName: 'xmark', iconStyle: 'solid'},
  },
  labelText: 'Dropdown with disabled option',
  onChange: args => null,
  size: 'm',
};

export const ThickAndThinIconDropdowns = MultipleTemplate.bind({});
ThickAndThinIconDropdowns.args = {
  components: [
    {
      name: 'thick-iconDropdown',
      options: [
        {
          value: 'option-1',
          label: 'Option 1',
          icon: {iconName: 'check', iconStyle: 'solid'},
        },
        {
          value: 'option-2',
          label: 'Option 2',
          icon: {iconName: 'xmark', iconStyle: 'solid'},
        },
      ],
      selectedOption: {
        value: 'option-1',
        label: 'Option 1',
        icon: {iconName: 'check', iconStyle: 'solid'},
      },
      labelText: 'Thick Dropdown',
      labelType: 'thick',
      onChange: args => null,
      size: 'm',
      disabled: false,
    },
    {
      name: 'thin-iconDropdown',
      options: [
        {
          value: 'option-1',
          label: 'Option 1',
          icon: {iconName: 'check', iconStyle: 'solid'},
        },
        {
          value: 'option-2',
          label: 'Option 2',
          icon: {iconName: 'xmark', iconStyle: 'solid'},
        },
      ],
      selectedOption: {
        value: 'option-1',
        label: 'Option 1',
        icon: {iconName: 'check', iconStyle: 'solid'},
      },
      labelText: 'Thin Dropdown',
      labelType: 'thin',
      onChange: args => null,
      size: 'm',
      disabled: false,
    },
  ],
};

export const GroupOfIconDropdownColors = MultipleTemplate.bind({});
GroupOfIconDropdownColors.args = {
  components: [
    {
      name: 'default-dropdown-white',
      options: [
        {
          value: 'option-1',
          label: 'Option 1',
          icon: {iconName: 'check', iconStyle: 'solid'},
        },
        {
          value: 'option-2',
          label: 'Option 2',
          icon: {iconName: 'xmark', iconStyle: 'solid'},
        },
      ],
      selectedOption: {
        value: 'option-1',
        label: 'Option 1',
        icon: {iconName: 'check', iconStyle: 'solid'},
      },
      labelText: 'White Dropdown',
      onChange: args => null,
      size: 'm',
      disabled: false,
      color: dropdownColors.white,
    },
    {
      name: 'default-dropdown-black',
      options: [
        {
          value: 'option-1',
          label: 'Option 1',
          icon: {iconName: 'check', iconStyle: 'solid'},
        },
        {
          value: 'option-2',
          label: 'Option 2',
          icon: {iconName: 'xmark', iconStyle: 'solid'},
        },
      ],
      selectedOption: {
        value: 'option-1',
        label: 'Option 1',
        icon: {iconName: 'check', iconStyle: 'solid'},
      },
      labelText: 'Black Dropdown',
      onChange: args => null,
      size: 'm',
      color: dropdownColors.black,
      disabled: false,
    },
    {
      name: 'default-dropdown-gray',
      options: [
        {
          value: 'option-1',
          label: 'Option 1',
          icon: {iconName: 'check', iconStyle: 'solid'},
        },
        {
          value: 'option-2',
          label: 'Option 2',
          icon: {iconName: 'xmark', iconStyle: 'solid'},
        },
      ],
      selectedOption: {
        value: 'option-1',
        label: 'Option 1',
        icon: {iconName: 'check', iconStyle: 'solid'},
      },
      labelText: 'Gray Dropdown',
      onChange: args => null,
      size: 'm',
      color: dropdownColors.gray,
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
        {
          value: 'option-1',
          label: 'Option 1',
          icon: {iconName: 'check', iconStyle: 'solid'},
        },
        {
          value: 'option-2',
          label: 'Option 2',
          icon: {iconName: 'xmark', iconStyle: 'solid'},
        },
      ],
      selectedOption: {
        value: 'option-1',
        label: 'Option 1',
        icon: {iconName: 'check', iconStyle: 'solid'},
      },
      labelText: 'XS Dropdown',
      onChange: args => null,
      size: 'xs',
      disabled: false,
      color: dropdownColors.black,
    },
    {
      name: 'default-dropdown-s',
      options: [
        {
          value: 'option-1',
          label: 'Option 1',
          icon: {iconName: 'check', iconStyle: 'solid'},
        },
        {
          value: 'option-2',
          label: 'Option 2',
          icon: {iconName: 'xmark', iconStyle: 'solid'},
        },
      ],
      selectedOption: {
        value: 'option-1',
        label: 'Option 1',
        icon: {iconName: 'check', iconStyle: 'solid'},
      },
      labelText: 'S Dropdown',
      onChange: args => null,
      size: 's',
      disabled: false,
      color: dropdownColors.black,
    },
    {
      name: 'default-dropdown-m',
      options: [
        {
          value: 'option-1',
          label: 'Option 1',
          icon: {iconName: 'check', iconStyle: 'solid'},
        },
        {
          value: 'option-2',
          label: 'Option 2',
          icon: {iconName: 'smile', iconStyle: 'solid'},
        },
      ],
      selectedOption: {
        value: 'option-1',
        label: 'Option 1',
        icon: {iconName: 'check', iconStyle: 'solid'},
      },
      labelText: 'M Dropdown',
      onChange: args => null,
      size: 'm',
      disabled: false,
      color: dropdownColors.black,
    },
    {
      name: 'default-dropdown-white',
      options: [
        {
          value: 'option-1',
          label: 'Option 1',
          icon: {iconName: 'check', iconStyle: 'solid'},
        },
        {
          value: 'option-2',
          label: 'Option 2',
          icon: {iconName: 'smile', iconStyle: 'solid'},
        },
      ],
      selectedOption: {
        value: 'option-1',
        label: 'Option 1',
        icon: {iconName: 'check', iconStyle: 'solid'},
      },
      labelText: 'L Dropdown',
      onChange: args => null,
      size: 'l',
      disabled: false,
      color: dropdownColors.black,
    },
  ],
};
