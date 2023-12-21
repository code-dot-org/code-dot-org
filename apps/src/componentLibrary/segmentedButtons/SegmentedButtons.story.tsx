import React from 'react';
import SegmentedButtons, {SegmentedButtonsProps} from './index';
import {Meta, Story} from '@storybook/react';

export default {
  title: 'DesignSystem/Segmented Buttons Component',
  component: SegmentedButtons,
} as Meta;

//
// TEMPLATE
//
const SingleTemplate: Story<SegmentedButtonsProps> = args => (
  <SegmentedButtons {...args} />
);

const MultipleTemplate: Story<{
  components: SegmentedButtonsProps[];
}> = args => (
  <>
    {args.components?.map(componentArg => (
      <SegmentedButtons key={componentArg.size} {...componentArg} />
    ))}
  </>
);

export const DefaultSegmentedButtons = SingleTemplate.bind({});
DefaultSegmentedButtons.args = {
  buttons: [
    {label: 'Label', onClick: () => alert('clicked'), value: 'label'},
    {
      label: 'Label Checked',
      onClick: () => alert('clicked'),
      iconLeft: {
        iconName: 'smile',
        iconStyle: 'solid',
        title: 'smile',
      },
      value: 'label-checked',
    },
    {
      label: 'Label Indeterminate',
      onClick: () => alert('clicked'),
      iconLeft: {
        iconName: 'smile',
        iconStyle: 'solid',
        title: 'smile',
      },
      iconRight: {
        iconName: 'smile',
        iconStyle: 'solid',
        title: 'smile',
      },
      value: 'label-indeterminate',
    },
  ],
  size: 'm',
  selectedButtonValue: 'label',
};

export const DisabledSegmentedButtons = MultipleTemplate.bind({});
DisabledSegmentedButtons.args = {
  components: [
    {
      buttons: [
        {
          label: 'Label',
          onClick: () => alert('clicked'),
          disabled: true,
          value: 'label',
        },
        {
          label: 'Label Checked',
          onClick: () => alert('clicked'),
          value: 'label-checked',
        },
        {
          label: 'Label Indeterminate',
          onClick: () => alert('clicked'),
          value: 'label-indeterminate',
        },
      ],
      size: 'm',
      selectedButtonValue: 'label-checked',
    },
  ],
};

export const SizesOfSegmentedButtons = MultipleTemplate.bind({});
SizesOfSegmentedButtons.args = {
  components: [
    {
      buttons: [
        {label: 'Label', onClick: () => alert('clicked'), value: 'label'},
        {
          label: 'Label Checked',
          onClick: () => alert('clicked'),
          value: 'label-checked',
        },
        {
          label: 'Label Indeterminate',
          onClick: () => alert('clicked'),
          value: 'label-indeterminate',
        },
      ],
      size: 'xs',
      selectedButtonValue: 'label',
    },
    {
      buttons: [
        {label: 'Label', onClick: () => alert('clicked'), value: 'label'},
        {
          label: 'Label Checked',
          onClick: () => alert('clicked'),
          value: 'label-checked',
        },
        {
          label: 'Label Indeterminate',
          onClick: () => alert('clicked'),
          value: 'label-indeterminate',
        },
      ],
      size: 's',
      selectedButtonValue: 'label-checked',
    },
    {
      buttons: [
        {label: 'Label', onClick: () => alert('clicked'), value: 'label'},
        {
          label: 'Label Checked',
          onClick: () => alert('clicked'),
          value: 'label-checked',
        },
        {
          label: 'Label Indeterminate',
          onClick: () => alert('clicked'),
          value: 'label-indeterminate',
        },
      ],
      size: 'm',
      selectedButtonValue: 'label-indeterminate',
    },
    {
      buttons: [
        {label: 'Label', onClick: () => alert('clicked'), value: 'label'},
        {
          label: 'Label Checked',
          onClick: () => alert('clicked'),
          value: 'label-checked',
        },
        {
          label: 'Label Indeterminate',
          onClick: () => alert('clicked'),
          value: 'label-indeterminate',
        },
      ],
      size: 'l',
      selectedButtonValue: 'label',
    },
  ],
};

export const TypesOfSegmentedButtons = MultipleTemplate.bind({});
TypesOfSegmentedButtons.args = {
  components: [
    {
      buttons: [
        {label: 'Label', onClick: () => alert('clicked'), value: 'label'},
        {
          label: 'Label Two',
          onClick: () => alert('clicked'),
          value: 'label-two',
        },
        {
          label: 'Label Three',
          onClick: () => alert('clicked'),
          value: 'label-three',
        },
      ],
      type: 'withLabel',
      selectedButtonValue: 'label',
    },
    {
      buttons: [
        {
          icon: {
            iconName: 'check',
            iconStyle: 'solid',
            title: 'check',
          },
          onClick: () => alert('clicked'),
          value: 'icon-check',
        },
        {
          icon: {
            iconName: 'smile',
            iconStyle: 'solid',
            title: 'smile',
          },
          onClick: () => alert('clicked'),
          value: 'icon-smile',
        },
        {
          icon: {
            iconName: 'house',
            iconStyle: 'solid',
            title: 'house',
          },
          onClick: () => alert('clicked'),
          value: 'icon-house',
        },
      ],
      type: 'iconOnly',
      selectedButtonValue: 'icon-check',
    },
    {
      buttons: [
        {label: '1', onClick: () => alert('clicked'), value: '1'},
        {
          label: '2',
          onClick: () => alert('clicked'),
          value: '2',
        },
        {
          label: '3',
          onClick: () => alert('clicked'),
          value: '3',
        },
      ],
      type: 'number',
      selectedButtonValue: '1',
    },
  ],
};
