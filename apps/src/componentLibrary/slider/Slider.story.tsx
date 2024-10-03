import {Meta, StoryFn} from '@storybook/react';
import React, {useState} from 'react';

import Slider, {SliderProps} from './index';

export default {
  title: 'DesignSystem/[WIP]Slider', // eslint-disable-line storybook/no-title-property-in-meta
  component: Slider,
} as Meta;

//
// TEMPLATE
//
// This is needed to fix children type error (passing string instead of React.ReactNode type)
// eslint-disable-next-line
const SingleTemplate: StoryFn<SliderProps> = args => {
  const [value, setValue] = useState(args.value);

  return (
    <Slider
      {...args}
      value={value || args.value}
      onChange={e => setValue(e.target.value)}
    />
  );
};

const MultipleTemplate: StoryFn<{
  components: SliderProps[];
}> = args => {
  const [values, setValues] = useState({} as Record<string, string | number>);

  return (
    <>
      {args.components?.map(componentArg => {
        return (
          <Slider
            key={componentArg.name}
            {...componentArg}
            value={values[componentArg.name] || componentArg.value}
            isRtl={document.documentElement.dir === 'rtl'}
            onChange={e =>
              setValues({...values, [componentArg.name]: e.target.value})
            }
          />
        );
      })}
    </>
  );
};

export const DefaultSlider = SingleTemplate.bind({});
DefaultSlider.args = {
  name: 'controlled_Slider',
  label: 'Slider Label',
  isCentered: false,
  value: 0,
};

export const PercentModeSlider = SingleTemplate.bind({});
PercentModeSlider.args = {
  name: 'controlled_Slider_percent',
  label: 'Slider Label',
  isCentered: false,
  isPercentMode: true,
  value: 0,
};

export const CenteredSlider = SingleTemplate.bind({});
CenteredSlider.args = {
  name: 'controlled_Slider_centered',
  label: 'Slider Label',
  isCentered: true,
  value: 50,
};

export const SliderWithButtons = SingleTemplate.bind({});
SliderWithButtons.args = {
  name: 'controlled_Slider_buttons',
  label: 'Slider Label',
  leftButtonProps: {
    icon: {iconName: 'minus', title: 'Decrease'},
    ['aria-label']: 'Decrease',
  },
  rightButtonProps: {
    icon: {iconName: 'plus', title: 'Increase'},
    ['aria-label']: 'Increase',
  },
  value: 0,
};

export const SliderWithoutButtons = SingleTemplate.bind({});
SliderWithoutButtons.args = {
  name: 'controlled_Slider_no_buttons',
  label: 'Slider Label',
  value: 0,
};

export const GroupOfDefaultSliders = MultipleTemplate.bind({});
GroupOfDefaultSliders.args = {
  components: [
    {
      name: 'test-regular-slider',
      label: 'Regular Slider',
      onChange: () => null,
      value: 0,
      leftButtonProps: {
        icon: {iconName: 'minus', title: 'Decrease'},
        ['aria-label']: 'Decrease',
      },
      rightButtonProps: {
        icon: {iconName: 'plus', title: 'Increase'},
        ['aria-label']: 'Increase',
      },
    },
    {
      name: 'test-percent-slider',
      label: 'Percent Slider',
      isPercentMode: true,
      onChange: () => null,
      value: 0,
      leftButtonProps: {
        icon: {iconName: 'turtle', title: 'Decrease'},
        ['aria-label']: 'Decrease',
      },
      rightButtonProps: {
        icon: {iconName: 'rabbit', title: 'Increase'},
        ['aria-label']: 'Increase',
      },
    },
    {
      name: 'test-centered-slider',
      label: 'Centered Slider',
      isCentered: true,
      value: 0,
      minValue: -100,
      maxValue: 100,
      onChange: () => null,
    },
    {
      name: 'test-steps',
      label: 'Steps Slider',
      value: 0,
      steps: [0, 25, 50, 75, 100],
      onChange: () => null,
    },
  ],
};

export const GroupOfDisabledSliders = MultipleTemplate.bind({});
GroupOfDisabledSliders.args = {
  components: [
    {
      name: 'slider-black-disabled',
      label: 'Slider Black Disabled',
      color: 'black',
      disabled: true,
      onChange: () => null,
      value: 0,
      leftButtonProps: {
        icon: {iconName: 'minus', title: 'Decrease'},
        ['aria-label']: 'Decrease',
      },
      rightButtonProps: {
        icon: {iconName: 'plus', title: 'Increase'},
        ['aria-label']: 'Increase',
      },
    },
    {
      name: 'slider-brand-disabled',
      label: 'Slider Brand Disabled',
      color: 'brand',
      disabled: true,
      onChange: () => null,
      value: 0,
      leftButtonProps: {
        icon: {iconName: 'minus', title: 'Decrease'},
        ['aria-label']: 'Decrease',
      },
      rightButtonProps: {
        icon: {iconName: 'plus', title: 'Increase'},
        ['aria-label']: 'Increase',
      },
    },
    {
      name: 'slider-white-disabled',
      label: 'Slider White Disabled',
      color: 'white',
      disabled: true,
      onChange: () => null,
      value: 0,
      leftButtonProps: {
        icon: {iconName: 'minus', title: 'Decrease'},
        ['aria-label']: 'Decrease',
      },
      rightButtonProps: {
        icon: {iconName: 'plus', title: 'Increase'},
        ['aria-label']: 'Increase',
      },
    },
    {
      name: 'slider-black-centered-disabled',
      label: 'Slider Black Centered Disabled',
      color: 'black',
      disabled: true,
      isCentered: true,
      onChange: () => null,
      value: 50,
      leftButtonProps: {
        icon: {iconName: 'minus', title: 'Decrease'},
        ['aria-label']: 'Decrease',
      },
      rightButtonProps: {
        icon: {iconName: 'plus', title: 'Increase'},
        ['aria-label']: 'Increase',
      },
    },
    {
      name: 'slider-brand-centered-disabled',
      label: 'Slider Brand Centered Disabled',
      color: 'brand',
      disabled: true,
      isCentered: true,
      onChange: () => null,
      value: 50,
      leftButtonProps: {
        icon: {iconName: 'minus', title: 'Decrease'},
        ['aria-label']: 'Decrease',
      },
      rightButtonProps: {
        icon: {iconName: 'plus', title: 'Increase'},
        ['aria-label']: 'Increase',
      },
    },
    {
      name: 'slider-white-centered-disabled',
      label: 'Slider White Centered Disabled',
      disabled: true,
      isCentered: true,
      onChange: () => null,
      value: 50,
      leftButtonProps: {
        icon: {iconName: 'minus', title: 'Decrease'},
        ['aria-label']: 'Decrease',
      },
      rightButtonProps: {
        icon: {iconName: 'plus', title: 'Increase'},
        ['aria-label']: 'Increase',
      },
    },
  ],
};

export const GroupOfColorsOfSliders = MultipleTemplate.bind({});
GroupOfColorsOfSliders.args = {
  components: [
    {
      name: 'slider-black',
      label: 'Slider Black',
      color: 'black',
      onChange: () => null,
      value: 0,
      leftButtonProps: {
        icon: {iconName: 'minus', title: 'Decrease'},
        ['aria-label']: 'Decrease',
      },
      rightButtonProps: {
        icon: {iconName: 'plus', title: 'Increase'},
        ['aria-label']: 'Increase',
      },
    },
    {
      name: 'slider-brand',
      label: 'Slider Brand',
      color: 'brand',
      onChange: () => null,
      value: 0,
      leftButtonProps: {
        icon: {iconName: 'minus', title: 'Decrease'},
        ['aria-label']: 'Decrease',
      },
      rightButtonProps: {
        icon: {iconName: 'plus', title: 'Increase'},
        ['aria-label']: 'Increase',
      },
    },
    {
      name: 'slider-white',
      label: 'Slider White',
      color: 'white',
      onChange: () => null,
      value: 0,
      leftButtonProps: {
        icon: {iconName: 'minus', title: 'Decrease'},
        ['aria-label']: 'Decrease',
      },
      rightButtonProps: {
        icon: {iconName: 'plus', title: 'Increase'},
        ['aria-label']: 'Increase',
      },
    },
    {
      name: 'slider-black-centered',
      label: 'Slider Black Centered',
      color: 'black',
      isCentered: true,
      onChange: () => null,
      value: 50,
      leftButtonProps: {
        icon: {iconName: 'minus', title: 'Decrease'},
        ['aria-label']: 'Decrease',
      },
      rightButtonProps: {
        icon: {iconName: 'plus', title: 'Increase'},
        ['aria-label']: 'Increase',
      },
    },
    {
      name: 'slider-brand-centered',
      label: 'Slider Brand Centered',
      color: 'brand',
      isCentered: true,
      onChange: () => null,
      value: 50,
      leftButtonProps: {
        icon: {iconName: 'minus', title: 'Decrease'},
        ['aria-label']: 'Decrease',
      },
      rightButtonProps: {
        icon: {iconName: 'plus', title: 'Increase'},
        ['aria-label']: 'Increase',
      },
    },
    {
      name: 'slider-white-centered',
      label: 'Slider White Centered',
      color: 'white',
      isCentered: true,
      onChange: () => null,
      value: 50,
      leftButtonProps: {
        icon: {iconName: 'minus', title: 'Decrease'},
        ['aria-label']: 'Decrease',
      },
      rightButtonProps: {
        icon: {iconName: 'plus', title: 'Increase'},
        ['aria-label']: 'Increase',
      },
    },
  ],
};
