import {Meta, StoryFn} from '@storybook/react';

import {Button} from '@/button';
import Link from '@/link/Link';

import CustomDropdown, {CustomDropdownProps} from '../CustomDropdown';

export default {
  title: 'DesignSystem/Dropdown/Custom Dropdown',
  component: CustomDropdown,
} as Meta;

//
// TEMPLATE
//
const SingleTemplate: StoryFn<CustomDropdownProps> = args => {
  return (
    <CustomDropdown
      {...args}
      name={args.name || 'custom-dropdown'}
      labelText={args.labelText || 'Custom Dropdown'}
    >
      <ul>
        <li key="1">
          <Button
            text="DSCO Button"
            onClick={() => console.log('Item 1 clicked')}
          />
        </li>
        <li key="2">
          <button onClick={() => console.log('Item 2 clicked')}>
            non-DSCO Button
          </button>
        </li>
        <li key="button-3">
          <Link text="DSCO Link" href="http://example.com" />
        </li>
      </ul>
    </CustomDropdown>
  );
};

export const DefaultCustomDropdown = SingleTemplate.bind({});
DefaultCustomDropdown.args = {
  name: 'default-dropdown',
  labelText: 'Default Dropdown',
  disabled: false,
  size: 'm',
  color: 'black',
};

export const DisabledCustomDropdown = SingleTemplate.bind({});
DisabledCustomDropdown.args = {
  name: 'disabled-dropdown',
  labelText: 'Disabled Dropdown',
  disabled: true,
  size: 'm',
};

export const WithIconCustomDropdown = SingleTemplate.bind({});
WithIconCustomDropdown.args = {
  name: 'with-icon-dropdown',
  labelText: 'Dropdown with Icon',
  icon: {
    iconName: 'filter',
    iconStyle: 'solid',
  },
  size: 'm',
};

export const WithSelectedValueCustomDropdown = SingleTemplate.bind({});
WithSelectedValueCustomDropdown.args = {
  name: 'with-selected-value-dropdown',
  labelText: 'Dropdown with Selected Value',
  isSomeValueSelected: true,
  size: 'm',
};

export const StyledAsFormFieldCustomDropdown = SingleTemplate.bind({});
StyledAsFormFieldCustomDropdown.args = {
  name: 'form-field-dropdown',
  labelText: 'Form Field Dropdown',
  styleAsFormField: true,
  selectedValueText: 'Selected Option',
  size: 'm',
};

export const WithHelperMessageCustomDropdown = SingleTemplate.bind({});
WithHelperMessageCustomDropdown.args = {
  name: 'with-helper-message-dropdown',
  labelText: 'Dropdown with Helper',
  helperMessage: 'This is a helper message',
  helperIcon: {
    iconName: 'info-circle',
    iconStyle: 'solid',
  },
  size: 'm',
};

export const WithErrorMessageCustomDropdown = SingleTemplate.bind({});
WithErrorMessageCustomDropdown.args = {
  name: 'with-error-message-dropdown',
  labelText: 'Dropdown with Error',
  errorMessage: 'This is an error message',
  size: 'm',
};

export const WithDSCOButtonTriggerCustomDropdown = SingleTemplate.bind({});
WithDSCOButtonTriggerCustomDropdown.args = {
  name: 'with-dsco-button-dropdown',
  labelText: 'Dropdown with DSCO Button',
  useDSCOButtonAsTrigger: true,
  triggerButtonProps: {
    text: 'Open Dropdown',
    color: 'purple',
    type: 'primary',
  },
  size: 'm',
};
