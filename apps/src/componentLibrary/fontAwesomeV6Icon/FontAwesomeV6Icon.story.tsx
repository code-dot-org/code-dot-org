import {Meta, StoryFn} from '@storybook/react';
import React from 'react';

import FontAwesomeV6Icon, {FontAwesomeV6IconProps} from './index';

export default {
  title: 'DesignSystem/FontAwesomeV6Icon', // eslint-disable-line storybook/no-title-property-in-meta
  component: FontAwesomeV6Icon,
} as Meta;

//
// TEMPLATE
//
// This is needed to fix children type error (passing string instead of React.ReactNode type)
// eslint-disable-next-line
const SingleTemplate: StoryFn<FontAwesomeV6IconProps> = args => (
  <FontAwesomeV6Icon {...args} />
);

const MultipleTemplate: StoryFn<{
  components: FontAwesomeV6IconProps[];
}> = args => (
  <>
    <p>
      * Font size and Margins on this screen does not represent Component's
      margins, and are only added to improve storybook view *
    </p>
    <p>Multiple Icons:</p>
    <div style={{display: 'flex', gap: '20px', fontSize: '25px'}}>
      {args.components?.map(componentArg => (
        <FontAwesomeV6Icon
          key={componentArg.iconName + componentArg.iconStyle}
          {...componentArg}
        />
      ))}
    </div>
  </>
);

export const DefaultFontAwesomeV6Icon = SingleTemplate.bind({});
DefaultFontAwesomeV6Icon.args = {
  iconStyle: 'solid',
  iconName: 'check',
  title: 'check',
};

export const BrandsIconExampleFontAwesomeV6Icon = MultipleTemplate.bind({});
BrandsIconExampleFontAwesomeV6Icon.args = {
  components: [
    {
      iconStyle: 'light',
      iconName: 'microsoft',
      iconFamily: 'brands',
      title: 'microsoft',
    },
    {
      iconName: 'google',
      iconFamily: 'brands',
      title: 'google',
    },
    {
      iconName: 'apple',
      iconFamily: 'brands',
      title: 'apple',
    },
  ],
};

export const GroupOfFamiliesOfFontAwesomeV6Icon = MultipleTemplate.bind({});
GroupOfFamiliesOfFontAwesomeV6Icon.args = {
  components: [
    {
      iconFamily: 'brands',
      iconName: 'github',
      title: 'github-brands',
    },
    {
      iconStyle: 'solid',
      iconFamily: 'duotone',
      iconName: 'house',
      title: 'house-duotone',
    },
    {
      iconFamily: 'kit',
      iconName: 'text-speech',
      title: 'text-speach-kit',
    },
  ],
};

export const GroupOfCustomIconsOfFontAwesomeV6Icon = MultipleTemplate.bind({});
GroupOfCustomIconsOfFontAwesomeV6Icon.args = {
  components: [
    {
      iconFamily: 'kit',
      iconName: 'click-to-continue-down',
      title: 'click-to-continue-down-kit',
    },
    {
      iconFamily: 'kit',
      iconName: 'click-to-continue-up',
      title: 'click-to-continue-up-kit',
    },
    {
      iconFamily: 'kit',
      iconName: 'connected-level',
      title: 'connected-level-kit',
    },
    {
      iconFamily: 'kit',
      iconName: 'ai-bot-solid',
      title: 'ai-bot-solid-kit',
    },
    {
      iconFamily: 'kit',
      iconName: 'ai-bot-regular',
      title: 'ai-bot-regular-kit',
    },
    {
      iconFamily: 'kit',
      iconName: 'text-speech-pause',
      title: 'text-speech-pause-kit',
    },
    {
      iconFamily: 'kit',
      iconName: 'text-speech',
      title: 'text-speech',
    },
    {
      iconFamily: 'kit',
      iconName: 'solid-thumbtack-slash',
      title: 'solid-thumbtack-slash-kit',
    },
    {
      iconFamily: 'kit',
      iconName: 'solid-gear-pen',
      title: 'solid-gear-pen-kit',
    },
    {
      iconFamily: 'kit',
      iconName: 'clever',
      title: 'clever-kit',
    },
  ],
};

export const GroupOfStylesOfFontAwesomeV6Icon = MultipleTemplate.bind({});
GroupOfStylesOfFontAwesomeV6Icon.args = {
  components: [
    {
      iconStyle: 'solid',
      iconName: 'house',
      title: 'house-solid',
    },
    {
      iconStyle: 'regular',
      iconName: 'house',
      title: 'house-regular',
    },
    {
      iconStyle: 'light',
      iconName: 'house',
      title: 'house-light',
    },
    {
      iconStyle: 'thin',
      iconName: 'house',
      title: 'house-thin',
    },
  ],
};
