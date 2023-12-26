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
    <p>
      * Margins on this screen does not represent Component's margins, and are
      only added to improve storybook view *
    </p>
    {args.components?.map(componentArg => (
      <div key={componentArg.size} style={{marginTop: 15}}>
        <SegmentedButtons {...componentArg} />
      </div>
    ))}
  </>
);

export const DefaultSegmentedButtons = SingleTemplate.bind({});
DefaultSegmentedButtons.args = {
  buttons: [
    {label: 'Label', onClick: () => alert('clicked'), value: 'label'},
    {
      label: 'Another label',
      onClick: () => alert('clicked'),
      value: 'another-label',
    },
    {
      label: 'Text',
      onClick: () => alert('clicked'),
      value: 'text',
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
          label: 'Another label',
          onClick: () => alert('clicked'),
          value: 'another-label',
        },
        {
          label: 'Text',
          onClick: () => alert('clicked'),
          value: 'text',
        },
      ],
      size: 'm',
      selectedButtonValue: 'another-label',
    },
  ],
};

export const SizesOfSegmentedButtons = MultipleTemplate.bind({});
SizesOfSegmentedButtons.args = {
  components: [
    {
      buttons: [
        {label: 'Label', onClick: () => alert('clicked'), value: 'label-xs'},
        {
          label: 'Another label',
          onClick: () => alert('clicked'),
          value: 'another-label-xs',
        },
        {
          label: 'Text',
          onClick: () => alert('clicked'),
          value: 'text-xs',
        },
      ],
      size: 'xs',
      selectedButtonValue: 'label-xs',
    },
    {
      buttons: [
        {label: 'Label', onClick: () => alert('clicked'), value: 'label-s'},
        {
          label: 'Another label',
          onClick: () => alert('clicked'),
          value: 'another-label-s',
        },
        {
          label: 'Text',
          onClick: () => alert('clicked'),
          value: 'text-s',
        },
      ],
      size: 's',
      selectedButtonValue: 'another-label-s',
    },
    {
      buttons: [
        {label: 'Label', onClick: () => alert('clicked'), value: 'label-m'},
        {
          label: 'Another label',
          onClick: () => alert('clicked'),
          value: 'another-label-m',
        },
        {
          label: 'Text',
          onClick: () => alert('clicked'),
          value: 'text-m',
        },
      ],
      size: 'm',
      selectedButtonValue: 'text-m',
    },
    {
      buttons: [
        {label: 'Label', onClick: () => alert('clicked'), value: 'label-l'},
        {
          label: 'Another label',
          onClick: () => alert('clicked'),
          value: 'another-label-l',
        },
        {
          label: 'Text',
          onClick: () => alert('clicked'),
          value: 'text-l',
        },
      ],
      size: 'l',
      selectedButtonValue: 'label-l',
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
          label: 'Label',
          onClick: () => alert('clicked'),
          value: 'label-il',
          iconLeft: {iconName: 'check', iconStyle: 'solid', title: 'check'},
        },
        {
          label: 'Label Two',
          onClick: () => alert('clicked'),
          value: 'label-two-il',
          iconLeft: {iconName: 'check', iconStyle: 'solid', title: 'check'},
        },
        {
          label: 'Label Three',
          onClick: () => alert('clicked'),
          value: 'label-three-il',
          iconLeft: {iconName: 'check', iconStyle: 'solid', title: 'check'},
        },
      ],
      type: 'withLabel',
      selectedButtonValue: 'label-il',
    },
    {
      buttons: [
        {
          label: 'Label',
          onClick: () => alert('clicked'),
          value: 'label-ir',
          iconRight: {iconName: 'check', iconStyle: 'solid', title: 'check'},
        },
        {
          label: 'Label Two',
          onClick: () => alert('clicked'),
          value: 'label-two-ir',
          iconRight: {iconName: 'check', iconStyle: 'solid', title: 'check'},
        },
        {
          label: 'Label Three',
          onClick: () => alert('clicked'),
          value: 'label-three-ir',
          iconRight: {iconName: 'check', iconStyle: 'solid', title: 'check'},
        },
      ],
      type: 'withLabel',
      selectedButtonValue: 'label-ir',
    },
    {
      buttons: [
        {
          label: 'Label',
          onClick: () => alert('clicked'),
          value: 'label-il-ir',
          iconLeft: {iconName: 'check', iconStyle: 'solid', title: 'check'},
          iconRight: {iconName: 'check', iconStyle: 'solid', title: 'check'},
        },
        {
          label: 'Label Two',
          onClick: () => alert('clicked'),
          value: 'label-two-il-ir',
          iconLeft: {iconName: 'check', iconStyle: 'solid', title: 'check'},
          iconRight: {iconName: 'check', iconStyle: 'solid', title: 'check'},
        },
        {
          label: 'Label Three',
          onClick: () => alert('clicked'),
          value: 'label-three-il-ir',
          iconLeft: {iconName: 'check', iconStyle: 'solid', title: 'check'},
          iconRight: {iconName: 'check', iconStyle: 'solid', title: 'check'},
        },
      ],
      type: 'withLabel',
      selectedButtonValue: 'label-il-ir',
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
