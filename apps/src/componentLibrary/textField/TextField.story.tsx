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
  onChange: () => null,
};

export const WithErrorTextField = SingleTemplate.bind({});
WithErrorTextField.args = {
  name: 'textfield_error',
  label: 'TextField Label',
  error: {
    hasError: true,
    message: 'Error message',
  },
  onChange: () => null,
};

export const WithHelperMessageTextField = SingleTemplate.bind({});
WithHelperMessageTextField.args = {
  name: 'textfield_helper_message',
  label: 'TextField Label',
  helperMessage: 'Helper message',
  onChange: () => null,
};

export const WithHelperMessageAndIconTextField = SingleTemplate.bind({});
WithHelperMessageAndIconTextField.args = {
  name: 'textfield_helper_icon',
  label: 'TextField Label',
  helperIcon: {
    iconName: 'info-circle',
  },
  helperMessage: 'Helper message',
  onChange: () => null,
};

export const WithPlaceholderTextField = SingleTemplate.bind({});
WithPlaceholderTextField.args = {
  name: 'textfield_placeholder',
  label: 'TextField Label',
  placeholder: 'Placeholder',
  onChange: () => null,
};

export const DisabledTextField = SingleTemplate.bind({});
DisabledTextField.args = {
  name: 'textfield_disabled',
  label: 'TextField Label',
  disabled: true,
  onChange: () => null,
};

export const ReadOnlyTextField = SingleTemplate.bind({});
ReadOnlyTextField.args = {
  name: 'textfield_readOnly',
  label: 'TextField Label',
  readOnly: true,
  onChange: () => null,
};

export const GroupOfTextFieldColors = MultipleTemplate.bind({});
GroupOfTextFieldColors.args = {
  components: [
    {
      name: 'textfield_color_black',
      label: 'Black TextField',
      color: 'black',
      onChange: () => null,
    },
    {
      name: 'textfield_color_gray',
      label: 'Gray TextField',
      color: 'gray',
      onChange: () => null,
    },
    {
      name: 'textfield_color_white',
      label: 'White TextField',
      color: 'white',
      onChange: () => null,
    },
  ],
};

export const GroupOfTextFieldSizes = MultipleTemplate.bind({});
GroupOfTextFieldSizes.args = {
  components: [
    {
      name: 'textfield_size_l',
      label: 'L TextField',
      helperIcon: {
        iconName: 'info-circle',
      },
      helperMessage: 'Helper message',
      size: 'l',
      onChange: () => null,
    },
    {
      name: 'textfield_size_m',
      label: 'M TextField',
      helperIcon: {
        iconName: 'info-circle',
      },
      helperMessage: 'Helper message',
      size: 'm',
      onChange: () => null,
    },
    {
      name: 'textfield_size_s',
      label: 'S TextField',
      helperIcon: {
        iconName: 'info-circle',
      },
      helperMessage: 'Helper message',
      size: 's',
      onChange: () => null,
    },
  ],
};
