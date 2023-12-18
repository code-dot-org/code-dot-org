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
    {label: 'Label', onClick: () => alert('clicked')},
    {
      label: 'Label Checked',
      onClick: () => alert('clicked'),
      iconLeft: {
        iconName: 'smile',
        iconStyle: 'solid',
        title: 'smile',
      },
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
    },
  ],
  size: 'm',
};

export const DisabledSegmentedButtons = MultipleTemplate.bind({});
DisabledSegmentedButtons.args = {
  components: [
    {
      buttons: [
        {label: 'Label', onClick: () => alert('clicked'), disabled: true},
        {
          label: 'Label Checked',
          onClick: () => alert('clicked'),
        },
        {
          label: 'Label Indeterminate',
          onClick: () => alert('clicked'),
        },
      ],
      size: 'm',
    },
  ],
};

export const SizesOfSegmentedButtons = MultipleTemplate.bind({});
SizesOfSegmentedButtons.args = {
  components: [
    {
      buttons: [
        {label: 'Label', onClick: () => alert('clicked')},
        {
          label: 'Label Checked',
          onClick: () => alert('clicked'),
        },
        {
          label: 'Label Indeterminate',
          onClick: () => alert('clicked'),
        },
      ],
      size: 'xs',
    },
    {
      buttons: [
        {label: 'Label', onClick: () => alert('clicked')},
        {
          label: 'Label Checked',
          onClick: () => alert('clicked'),
        },
        {
          label: 'Label Indeterminate',
          onClick: () => alert('clicked'),
        },
      ],
      size: 's',
    },
    {
      buttons: [
        {label: 'Label', onClick: () => alert('clicked')},
        {
          label: 'Label Checked',
          onClick: () => alert('clicked'),
        },
        {
          label: 'Label Indeterminate',
          onClick: () => alert('clicked'),
        },
      ],
      size: 'm',
    },
    {
      buttons: [
        {label: 'Label', onClick: () => alert('clicked')},
        {
          label: 'Label Checked',
          onClick: () => alert('clicked'),
        },
        {
          label: 'Label Indeterminate',
          onClick: () => alert('clicked'),
        },
      ],
      size: 'l',
    },
  ],
};

export const TypesOfSegmentedButtons = MultipleTemplate.bind({});
TypesOfSegmentedButtons.args = {
  components: [
    {
      buttons: [
        {label: 'Label', onClick: () => alert('clicked')},
        {
          label: 'Label Checked',
          onClick: () => alert('clicked'),
        },
        {
          label: 'Label Indeterminate',
          onClick: () => alert('clicked'),
        },
      ],
      type: 'withLabel',
    },
    {
      buttons: [
        {label: 'Label', onClick: () => alert('clicked')},
        {
          label: 'Label Checked',
          onClick: () => alert('clicked'),
        },
        {
          label: 'Label Indeterminate',
          onClick: () => alert('clicked'),
        },
      ],
      type: 'iconOnly',
    },
    {
      buttons: [
        {label: 'Label', onClick: () => alert('clicked')},
        {
          label: 'Label Checked',
          onClick: () => alert('clicked'),
        },
        {
          label: 'Label Indeterminate',
          onClick: () => alert('clicked'),
        },
      ],
      type: 'number',
    },
  ],
};
