import {Meta, StoryFn} from '@storybook/react';
import React from 'react';

import CloseButton, {CloseButtonProps} from './index';

export default {
  title: 'DesignSystem/CloseButton', // eslint-disable-line storybook/no-title-property-in-meta
  component: CloseButton,
} as Meta;

//
// TEMPLATE
//
const SingleTemplate: StoryFn<CloseButtonProps> = args => (
  <CloseButton {...args} />
);

const MultipleTemplate: StoryFn<{
  components: CloseButtonProps[];
}> = args => (
  <>
    <p>
      * Margins on this screen do not represent Component's margins, and are
      only added to improve storybook view *
    </p>
    <p>Multiple CloseButtons:</p>
    <div style={{display: 'flex', gap: '20px'}}>
      {args.components?.map((componentArg, index) => (
        <CloseButton key={index} {...componentArg} />
      ))}
    </div>
  </>
);

export const DefaultCloseButton = SingleTemplate.bind({});
DefaultCloseButton.args = {
  onClick: () => null,
};

export const GroupOfColorsOfCloseButton = MultipleTemplate.bind({});
GroupOfColorsOfCloseButton.args = {
  components: [
    {onClick: () => null, color: 'light'},
    {onClick: () => null, color: 'dark'},
  ],
};

export const GroupOfSizesOfCloseButton = MultipleTemplate.bind({});
GroupOfSizesOfCloseButton.args = {
  components: [
    {onClick: () => null, size: 'm'},
    {onClick: () => null, size: 'l'},
  ],
};
