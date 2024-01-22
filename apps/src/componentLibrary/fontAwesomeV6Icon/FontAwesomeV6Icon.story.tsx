import React from 'react';
import FontAwesomeV6Icon, {FontAwesomeV6IconProps} from './index';
import {Meta, Story} from '@storybook/react';

export default {
  title: 'DesignSystem/FontAwesomeV6Icon Component',
  component: FontAwesomeV6Icon,
} as Meta;

//
// TEMPLATE
//
// This is needed to fix children type error (passing string instead of React.ReactNode type)
// eslint-disable-next-line
const SingleTemplate: Story<FontAwesomeV6IconProps> = args => (
  <FontAwesomeV6Icon {...args} />
);

const MultipleTemplate: Story<{
  components: FontAwesomeV6IconProps[];
}> = args => (
  <>
    {args.components?.map(componentArg => (
      <FontAwesomeV6Icon
        key={componentArg.iconName + componentArg.iconStyle}
        {...componentArg}
      />
    ))}
  </>
);

export const DefaultFontAwesomeV6Icon = SingleTemplate.bind({});
DefaultFontAwesomeV6Icon.args = {
  iconStyle: 'solid',
  iconName: 'check',
  title: 'check',
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
