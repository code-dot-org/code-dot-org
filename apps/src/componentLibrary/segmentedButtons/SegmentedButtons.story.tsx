import {Meta, StoryFn} from '@storybook/react';
import React, {useState} from 'react';

import SegmentedButtons, {SegmentedButtonsProps} from './index';

export default {
  title: 'DesignSystem/Segmented Buttons', // eslint-disable-line storybook/no-title-property-in-meta
  component: SegmentedButtons,
} as Meta;

//
// TEMPLATE
//
const SingleTemplate: StoryFn<SegmentedButtonsProps> = args => {
  const [value, setValues] = useState('');

  return (
    <SegmentedButtons
      {...args}
      onChange={val => {
        setValues(val);
        args.onChange(val);
      }}
      selectedButtonValue={value || args.selectedButtonValue}
    />
  );
};

const MultipleTemplate: StoryFn<{
  components: SegmentedButtonsProps[];
}> = args => {
  const [value, setValues] = useState({} as Record<string, string>);

  return (
    <>
      <p>
        * Margins on this screen does not represent Component's margins, and are
        only added to improve storybook view *
      </p>
      {args.components?.map(componentArg => (
        <div key={componentArg.size} style={{marginTop: 15}}>
          <SegmentedButtons
            {...componentArg}
            selectedButtonValue={
              value[componentArg.selectedButtonValue] ||
              componentArg.selectedButtonValue
            }
            onChange={value =>
              setValues(values => ({
                ...values,
                [componentArg.selectedButtonValue]: value,
              }))
            }
          />
        </div>
      ))}
    </>
  );
};

export const DefaultSegmentedButtons = SingleTemplate.bind({});
DefaultSegmentedButtons.args = {
  buttons: [
    {label: 'Label', value: 'label'},
    {
      label: 'Another label',
      value: 'another-label',
    },
    {
      label: 'Text',
      value: 'text',
    },
  ],
  size: 'm',
  selectedButtonValue: 'label',
  onChange: value => console.log('clicked: ', value),
};

export const DisabledSegmentedButtons = MultipleTemplate.bind({});
DisabledSegmentedButtons.args = {
  components: [
    {
      buttons: [
        {
          label: 'Label',
          disabled: true,
          value: 'label',
        },
        {
          label: 'Another label',
          value: 'another-label',
        },
        {
          label: 'Text',
          value: 'text',
        },
      ],
      size: 'm',
      selectedButtonValue: 'another-label',
      onChange: value => console.log('clicked: ', value),
    },
  ],
};

export const SizesOfSegmentedButtons = MultipleTemplate.bind({});
SizesOfSegmentedButtons.args = {
  components: [
    {
      buttons: [
        {label: 'Label', value: 'label-xs'},
        {
          label: 'Another label',
          value: 'another-label-xs',
        },
        {
          label: 'Text',
          value: 'text-xs',
        },
      ],
      size: 'xs',
      selectedButtonValue: 'label-xs',
      onChange: value => console.log('clicked: ', value),
    },
    {
      buttons: [
        {label: 'Label', value: 'label-s'},
        {
          label: 'Another label',
          value: 'another-label-s',
        },
        {
          label: 'Text',
          value: 'text-s',
        },
      ],
      size: 's',
      selectedButtonValue: 'another-label-s',
      onChange: value => console.log('clicked: ', value),
    },
    {
      buttons: [
        {label: 'Label', value: 'label-m'},
        {
          label: 'Another label',
          value: 'another-label-m',
        },
        {
          label: 'Text',
          value: 'text-m',
        },
      ],
      size: 'm',
      selectedButtonValue: 'text-m',
      onChange: value => console.log('clicked: ', value),
    },
    {
      buttons: [
        {label: 'Label', value: 'label-l'},
        {
          label: 'Another label',
          value: 'another-label-l',
        },
        {
          label: 'Text',
          value: 'text-l',
        },
      ],
      size: 'l',
      selectedButtonValue: 'label-l',
      onChange: value => console.log('clicked: ', value),
    },
  ],
};

export const GroupOfColorsOfSegmentedButtons = MultipleTemplate.bind({});
GroupOfColorsOfSegmentedButtons.args = {
  components: [
    {
      buttons: [
        {label: 'Label Primary', value: 'label-primary'},
        {
          label: 'Another label',
          value: 'another-label-primary',
        },
        {
          label: 'Text',
          value: 'text-primary',
        },
      ],
      color: 'primary',
      selectedButtonValue: 'label-primary',
      onChange: value => console.log('clicked: ', value),
    },
    {
      buttons: [
        {label: 'Label Secondary', value: 'label-strong'},
        {
          label: 'Another label',
          value: 'another-label-strong',
        },
        {
          label: 'Text',
          value: 'text-strong',
        },
      ],
      color: 'strong',
      selectedButtonValue: 'another-label-strong',
      onChange: value => console.log('clicked: ', value),
    },
  ],
};

export const TypesOfSegmentedButtons = MultipleTemplate.bind({});
TypesOfSegmentedButtons.args = {
  components: [
    {
      buttons: [
        {label: 'Label', value: 'label'},
        {
          label: 'Label Two',
          value: 'label-two',
        },
        {
          label: 'Label Three',
          value: 'label-three',
        },
      ],
      type: 'withLabel',
      selectedButtonValue: 'label',
      onChange: value => console.log('clicked: ', value),
    },
    {
      buttons: [
        {
          label: 'Label',
          value: 'label-il',
          iconLeft: {iconName: 'check', iconStyle: 'solid', title: 'check'},
        },
        {
          label: 'Label Two',
          value: 'label-two-il',
          iconLeft: {iconName: 'house', iconStyle: 'solid', title: 'check'},
        },
        {
          label: 'Label Three',
          value: 'label-three-il',
          iconLeft: {iconName: 'smile', iconStyle: 'solid', title: 'check'},
        },
      ],
      type: 'withLabel',
      selectedButtonValue: 'label-il',
      onChange: value => console.log('clicked: ', value),
    },
    {
      buttons: [
        {
          label: 'Label',
          value: 'label-ir',
          iconRight: {iconName: 'check', iconStyle: 'solid', title: 'check'},
        },
        {
          label: 'Label Two',
          value: 'label-two-ir',
          iconRight: {iconName: 'smile', iconStyle: 'solid', title: 'check'},
        },
        {
          label: 'Label Three',
          value: 'label-three-ir',
          iconRight: {iconName: 'house', iconStyle: 'solid', title: 'check'},
        },
      ],
      type: 'withLabel',
      selectedButtonValue: 'label-ir',
      onChange: value => console.log('clicked: ', value),
    },
    {
      buttons: [
        {
          label: 'Label',
          value: 'label-il-ir',
          iconLeft: {iconName: 'check', iconStyle: 'solid', title: 'check'},
          iconRight: {iconName: 'xmark', iconStyle: 'solid', title: 'check'},
        },
        {
          label: 'Label Two',
          value: 'label-two-il-ir',
          iconLeft: {iconName: 'xmark', iconStyle: 'solid', title: 'check'},
          iconRight: {iconName: 'check', iconStyle: 'solid', title: 'check'},
        },
        {
          label: 'Label Three',
          value: 'label-three-il-ir',
          iconLeft: {iconName: 'smile', iconStyle: 'solid', title: 'check'},
          iconRight: {iconName: 'house', iconStyle: 'solid', title: 'check'},
        },
      ],
      type: 'withLabel',
      selectedButtonValue: 'label-il-ir',
      onChange: value => console.log('clicked: ', value),
    },
    {
      buttons: [
        {
          icon: {
            iconName: 'check',
            iconStyle: 'solid',
            title: 'check',
          },
          value: 'icon-check',
        },
        {
          icon: {
            iconName: 'smile',
            iconStyle: 'solid',
            title: 'smile',
          },
          value: 'icon-smile',
        },
        {
          icon: {
            iconName: 'house',
            iconStyle: 'solid',
            title: 'house',
          },
          value: 'icon-house',
        },
      ],
      type: 'iconOnly',
      selectedButtonValue: 'icon-check',
      onChange: value => console.log('clicked: ', value),
    },
    {
      buttons: [
        {label: '1', value: '1'},
        {
          label: '2',
          value: '2',
        },
        {
          label: '3',
          value: '3',
        },
      ],
      type: 'number',
      selectedButtonValue: '1',
      onChange: value => console.log('clicked: ', value),
    },
  ],
};
