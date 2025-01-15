import {Meta, StoryFn} from '@storybook/react';
import {useState, useCallback} from 'react';

import {dropdownColors} from './../../index';

import IconDropdown, {IconDropdownProps, IconDropdownOption} from '../index';

export default {
  title: 'DesignSystem/Dropdown/Icon Dropdown',
  component: IconDropdown.type,
} as Meta;

//
// TEMPLATE
//
const SingleTemplate: StoryFn<IconDropdownProps> = args => {
  const [selectedValue, setValue] = useState(
    args.selectedOption as IconDropdownOption,
  );
  const onChange = useCallback(
    (option: IconDropdownOption) => {
      setValue(option);
      args.onChange(option);
    },
    [args, setValue],
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
    {} as Record<string, IconDropdownOption>,
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
  onChange: () => null,
  size: 'm',
};

export const ReadOnlyIconDropdown = SingleTemplate.bind({});
ReadOnlyIconDropdown.args = {
  name: 'readOnly-dropdown',
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
  labelText: 'ReadOnly Dropdown',
  onChange: () => null,
  readOnly: true,
  color: dropdownColors.black,
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
  onChange: () => null,
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
  onChange: () => null,
  size: 'm',
};

export const StyledAsFieldIconDropdown = SingleTemplate.bind({});
StyledAsFieldIconDropdown.args = {
  name: 'styled-as-field-icon-dropdown',
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
  labelText: 'Styled as Field Icon Dropdown',
  onChange: args => console.log(args),
  helperMessage: 'Helper message',
  styleAsFormField: true,
  size: 'm',
};

export const WithErrorDropdown = SingleTemplate.bind({});
WithErrorDropdown.args = {
  name: 'error-dropdown',
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
  labelText: 'Error Dropdown',
  onChange: args => console.log(args),
  errorMessage: 'Error message',
  size: 'm',
};

export const WithHelperMessageDropdown = SingleTemplate.bind({});
WithHelperMessageDropdown.args = {
  name: 'helper-message-dropdown',
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
  labelText: 'Helper Message Dropdown',
  onChange: args => console.log(args),
  helperMessage: 'Helper message',
  size: 'm',
};

export const WithHelperMessageAndIconDropdown = SingleTemplate.bind({});
WithHelperMessageAndIconDropdown.args = {
  name: 'helper-icon-dropdown',
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
  labelText: 'Helper Icon Dropdown',
  onChange: args => console.log(args),
  helperIcon: {
    iconName: 'info-circle',
  },
  helperMessage: 'Helper message',
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
      onChange: () => null,
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
      onChange: () => null,
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
      onChange: () => null,
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
      onChange: () => null,
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
      onChange: () => null,
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
      onChange: () => null,
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
      onChange: () => null,
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
      onChange: () => null,
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
      onChange: () => null,
      size: 'l',
      disabled: false,
      color: dropdownColors.black,
    },
  ],
};
