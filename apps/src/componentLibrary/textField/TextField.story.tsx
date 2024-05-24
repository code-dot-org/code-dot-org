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
//
const MultipleTemplate: StoryFn<{
  components: TextFieldProps[];
}> = args => (
  <>
    {args.components?.map(componentArg => (
      <TextField key={componentArg.name} {...componentArg} />
    ))}
  </>
);

export const DefaultTextField = SingleTemplate.bind({});
DefaultTextField.args = {
  name: 'textfield_default',
  label: 'TextField Label',
};

export const WithErrorTextField = SingleTemplate.bind({});
WithErrorTextField.args = {
  name: 'textfield_error',
  label: 'TextField Label',
  error: {
    hasError: true,
    message: 'Error message',
  },
};

export const WithHelperMessageTextField = SingleTemplate.bind({});
WithHelperMessageTextField.args = {
  name: 'textfield_helper_message',
  label: 'TextField Label',
  helperMessage: 'Helper message',
};

export const WithHelperMessageAndIconTextField = SingleTemplate.bind({});
WithHelperMessageAndIconTextField.args = {
  name: 'textfield_helper_icon',
  label: 'TextField Label',
  helperIcon: {
    iconName: 'info-circle',
  },
  helperMessage: 'Helper message',
};

export const WithPlaceholderTextField = SingleTemplate.bind({});
WithPlaceholderTextField.args = {
  name: 'textfield_placeholder',
  label: 'TextField Label',
  placeholder: 'Placeholder',
};

export const DisabledTextField = SingleTemplate.bind({});
DisabledTextField.args = {
  name: 'textfield_disabled',
  label: 'TextField Label',
  disabled: true,
};

export const ReadOnlyTextField = SingleTemplate.bind({});
ReadOnlyTextField.args = {
  name: 'textfield_readonly',
  label: 'TextField Label',
  readonly: true,
};

export const GroupOfTextFieldColors = MultipleTemplate.bind({});
GroupOfTextFieldColors.args = {
  components: [
    {
      name: 'textfield_color_black',
      label: 'Black TextField',
      color: 'black',
    },
    {
      name: 'textfield_color_gray',
      label: 'Gray TextField',
      color: 'gray',
    },
    {
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
      name: 'textfield_size_l',
      label: 'L TextField',
      size: 'l',
    },
    {
      name: 'textfield_size_m',
      label: 'M TextField',
      size: 'm',
    },
    {
      name: 'textfield_size_s',
      label: 'S TextField',
      size: 's',
    },
    {
      name: 'textfield_size_xs',
      label: 'XS TextField',
      size: 'xs',
    },
  ],
};
