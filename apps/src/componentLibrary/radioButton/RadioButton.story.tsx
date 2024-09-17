import {Meta, StoryFn} from '@storybook/react';
import React from 'react';

import Tags from '@cdo/apps/componentLibrary/tags';

import {
  RadioButton,
  RadioButtonProps,
  RadioButtonsGroup,
  RadioButtonsGroupProps,
} from './index';

export default {
  title: 'DesignSystem/Radio Button', // eslint-disable-line storybook/no-title-property-in-meta
  /**
   * Storybook Docs Generation doesn't work properly (as of 07.19.2023).
   * This workaround (component: Component.type instead of component: Component) is taken from
   * https://github.com/storybookjs/storybook/issues/18136#issue-1225692751
   * Feel free to remove this workaround when storybook fixes this issue.
   */
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore-next-line
  component: RadioButton.type,
} as Meta;

//
// TEMPLATE
//
// This is needed to fix children type error (passing string instead of React.ReactNode type)
// eslint-disable-next-line
const SingleTemplate: StoryFn<RadioButtonProps> = args => (
  <RadioButton {...args} />
);

const MultipleTemplate: StoryFn<RadioButtonsGroupProps> = args => (
  <>
    <RadioButtonsGroup {...args} />
  </>
);

export const DefaultRadioButton = SingleTemplate.bind({});
DefaultRadioButton.args = {
  name: 'radio1',
  label: 'RadioButton 1',
  value: 'radio1',
};

export const DefaultRadioButtonGroup = MultipleTemplate.bind({});
DefaultRadioButtonGroup.args = {
  radioButtons: [
    {name: 'radio1', label: 'RadioButton 1', value: 'radio1'},
    {name: 'radio2', label: 'RadioButton 2', value: 'radio2'},
  ],
};

export const DisabledRadioButton = MultipleTemplate.bind({});
DisabledRadioButton.args = {
  defaultValue: 'test-disabled-checked',
  radioButtons: [
    {
      name: 'test-disabled',
      value: 'test-disabled',
      label: 'Disabled radioButton',
      disabled: true,
    },
    {
      name: 'test-disabled-checked',
      value: 'test-disabled-checked',
      label: 'Disabled checked radioButton',
      disabled: true,
    },
  ],
};

export const RadioButtonsWithCustomContent = MultipleTemplate.bind({});
RadioButtonsWithCustomContent.args = {
  radioButtons: [
    {
      name: 'test-custom-content-0',
      value: 'test-custom-content-0',
      label: '',
      size: 'm',
      children: (
        <>
          <span>With Custom Content</span>
          <button type="button">Custom content</button>
        </>
      ),
    },
    {
      name: 'test-custom-content-1',
      value: 'test-custom-content-1',
      label: 'With Custom Content and Label',
      size: 'm',
      children: (
        <Tags
          tagsList={[
            {label: 'Tag1', tooltipContent: 'Tag tooltip', tooltipId: ''},
          ]}
        />
      ),
    },
    {
      name: 'test-custom-content-2',
      value: 'test-custom-content-2',
      label: 'Without Custom Content',
      size: 'm',
    },
  ],
};

export const SizesOfRadioButton = MultipleTemplate.bind({});
SizesOfRadioButton.args = {
  radioButtons: [
    {name: 'test-xs', value: 'test-xs', label: 'Label - XS', size: 'xs'},
    {name: 'test-s', value: 'test-s', label: 'Label - S', size: 's'},
    {name: 'test-m', value: 'test-m', label: 'Label - M', size: 'm'},
    {name: 'test-l', value: 'test-l', label: 'Label - L', size: 'l'},
  ],
};
