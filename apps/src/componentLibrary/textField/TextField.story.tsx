import {Meta, StoryFn} from '@storybook/react';
import React from 'react';

import TextField, {TextFieldProps} from './index';

export default {
  title: 'DesignSystem/TextField', // eslint-disable-line storybook/no-title-property-in-meta
  component: TextField,
} as Meta;

//
// TEMPLATE
//
const SingleTemplate: StoryFn<TextFieldProps> = args => <TextField {...args} />;
const MultipleTemplate: StoryFn<{
  components: TextFieldProps[];
}> = args => (
  <>
    {args.components?.map(componentArg => (
      <TextField key={componentArg.name} {...componentArg} />
    ))}
  </>
);

const defaultArgs = {
  onChange: () => null,
};

export const DefaultTextField = SingleTemplate.bind({});
DefaultTextField.args = {
  ...defaultArgs,
  name: 'textfield_default',
  label: 'TextField Label',
};

export const WithErrorTextField = SingleTemplate.bind({});
WithErrorTextField.args = {
  ...defaultArgs,
  name: 'textfield_error',
  label: 'TextField Label',
  errorMessage: 'Error message',
};

export const PasswordTextField = SingleTemplate.bind({});
PasswordTextField.args = {
  ...defaultArgs,
  name: 'textfield_password',
  inputType: 'password',
};

export const NumberTextField = SingleTemplate.bind({});
NumberTextField.args = {
  ...defaultArgs,
  name: 'textfield_number',
  inputType: 'number',
};

export const EmailTextField = SingleTemplate.bind({});
EmailTextField.args = {
  ...defaultArgs,
  name: 'textfield_email',
  inputType: 'email',
};

export const WithHelperMessageTextField = SingleTemplate.bind({});
WithHelperMessageTextField.args = {
  ...defaultArgs,
  name: 'textfield_helper_message',
  label: 'TextField Label',
  helperMessage: 'Helper message',
};

export const WithHelperMessageAndIconTextField = SingleTemplate.bind({});
WithHelperMessageAndIconTextField.args = {
  ...defaultArgs,
  name: 'textfield_helper_icon',
  label: 'TextField Label',
  helperIcon: {
    iconName: 'info-circle',
  },
  helperMessage: 'Helper message',
};

export const WithPlaceholderTextField = SingleTemplate.bind({});
WithPlaceholderTextField.args = {
  ...defaultArgs,
  name: 'textfield_placeholder',
  label: 'TextField Label',
  placeholder: 'Placeholder',
};

export const DisabledTextField = SingleTemplate.bind({});
DisabledTextField.args = {
  ...defaultArgs,
  name: 'textfield_disabled',
  label: 'TextField Label',
  disabled: true,
};

export const ReadOnlyTextField = SingleTemplate.bind({});
ReadOnlyTextField.args = {
  ...defaultArgs,
  name: 'textfield_readOnly',
  label: 'TextField Label',
  readOnly: true,
};

export const GroupOfTextFieldColors = MultipleTemplate.bind({});
GroupOfTextFieldColors.args = {
  components: [
    {
      ...defaultArgs,
      name: 'textfield_color_black',
      label: 'Black TextField',
      color: 'black',
    },
    {
      ...defaultArgs,
      name: 'textfield_color_gray',
      label: 'Gray TextField',
      color: 'gray',
    },
    {
      ...defaultArgs,
      name: 'textfield_color_white',
      label: 'White TextField',
      color: 'white',
    },
  ],
};

export const GroupOfTextFieldSizes = MultipleTemplate.bind({});
GroupOfTextFieldSizes.args = {
  components: [
    {
      ...defaultArgs,
      name: 'textfield_size_l',
      label: 'L TextField',
      helperIcon: {
        iconName: 'info-circle',
      },
      helperMessage: 'Helper message',
      size: 'l',
    },
    {
      ...defaultArgs,
      name: 'textfield_size_m',
      label: 'M TextField',
      helperIcon: {
        iconName: 'info-circle',
      },
      helperMessage: 'Helper message',
      size: 'm',
    },
    {
      ...defaultArgs,
      name: 'textfield_size_s',
      label: 'S TextField',
      helperIcon: {
        iconName: 'info-circle',
      },
      helperMessage: 'Helper message',
      size: 's',
    },
  ],
};
