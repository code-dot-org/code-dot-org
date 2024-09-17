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
      * Margins on this screen does not represent Component's margins, and are
      only added to improve storybook view *
    </p>
    <p>Multiple Icons:</p>
    <div style={{display: 'flex', gap: '20px'}}>
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

export const ClassNameBrandsIconExampleFontAwesomeV6Icon =
  MultipleTemplate.bind({});
ClassNameBrandsIconExampleFontAwesomeV6Icon.args = {
  components: [
    {
      iconStyle: 'light',
      iconName: 'microsoft',
      className: 'fa-brands',
      title: 'microsoft',
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
