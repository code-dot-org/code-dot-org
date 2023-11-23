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
  tagsList: [
    {id: 'math', label: 'Math', tooltipContent: 'Math'},
    {
      label: '+1',
      tooltipContent: (
        <>
          <p>Science,</p> <p>English</p>
        </>
      ),
    },
  ],
  size: 'm',
};

export const DisabledTags = SingleTemplate.bind({});
DisabledTags.args = {
  tagsList: [
    {id: 'math', label: 'Math', tooltipContent: 'Math'},
    {
      label: '+1',
      tooltipContent: (
        <>
          <p>Science,</p> <p>English</p>
        </>
      ),
    },
  ],
  styleAsDisabled: true,
  size: 'm',
};

export const GroupOfSizesOfTags = MultipleTemplate.bind({});
GroupOfSizesOfTags.args = {
  components: [
    {
      tagsList: [
        {id: 'math', label: 'Math S', tooltipContent: 'Math S'},
        {
          label: '+1',
          tooltipContent: (
            <>
              <p>Science S,</p> <p>English S</p>
            </>
          ),
        },
      ],
      size: 's',
    },
    {
      tagsList: [
        {id: 'math', label: 'Math M', tooltipContent: 'Math M'},
        {
          label: '+1',
          tooltipContent: (
            <>
              <p>Science M,</p> <p>English M</p>
            </>
          ),
        },
      ],
      size: 'm',
    },
    {
      tagsList: [
        {id: 'math', label: 'Math L', tooltipContent: 'Math L'},
        {
          label: '+1',
          tooltipContent: (
            <>
              <p>Science L,</p> <p>English L</p>
            </>
          ),
        },
      ],
      size: 'l',
    },
  ],
};
