import React from 'react';
import Tags, {TagsProps} from './index';
import {Meta, Story} from '@storybook/react';

export default {
  title: 'DesignSystem/Tags Component',
  component: Tags,
} as Meta;

//
// TEMPLATE
//
//  Using marginTop to separate components in storybook and prevent tooltip from hiding under the Storybook HUD.
const SingleTemplate: Story<TagsProps> = args => (
  <div style={{marginTop: 50}}>
    <Tags {...args} />
  </div>
);

const MultipleTemplate: Story<{
  components: TagsProps[];
}> = args => (
  <>
    {args.components?.map(componentArg => (
      <div key={componentArg.size} style={{marginTop: 45}}>
        <Tags {...componentArg} />
      </div>
    ))}
  </>
);

export const DefaultTags = SingleTemplate.bind({});
DefaultTags.args = {
  tagsList: ['Math', 'Science', 'English'],
  size: 'm',
};

export const DisabledTags = SingleTemplate.bind({});
DisabledTags.args = {
  tagsList: ['Math', 'Science', 'English'],
  styleAsDisabled: true,
  size: 'm',
};

export const GroupOfSizesOfTags = MultipleTemplate.bind({});
GroupOfSizesOfTags.args = {
  components: [
    {
      tagsList: ['Math S', 'Science S', 'English S'],
      size: 's',
    },
    {
      tagsList: ['Math M', 'Science M', 'English M'],
      size: 'm',
    },
    {
      tagsList: ['Math L', 'Science L', 'English L'],
      size: 'l',
    },
  ],
};
