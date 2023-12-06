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
  <>
    <p>
      * Margins on this screen does not represent Component's margins, and are
      only added to improve storybook view *{' '}
    </p>
    <div style={{marginTop: 50}}>
      <Tags {...args} />
    </div>
  </>
);

const MultipleTemplate: Story<{
  components: TagsProps[];
}> = args => (
  <>
    <p>
      * Margins on this screen does not represent Component's margins, and are
      only added to improve storybook view *{' '}
    </p>

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
    {tooltipId: 'math', label: 'Math', tooltipContent: 'Math'},
    {
      label: '+1',
      icon: {icon: ' fa-solid fa-check', title: 'check', placement: 'left'},
      tooltipId: 'science-english',
      tooltipContent: (
        <>
          <p>Science,</p> <p>English</p>
        </>
      ),
    },
    {
      label: '+1',
      icon: {icon: ' fa-solid fa-check', title: 'check', placement: 'right'},
      tooltipId: 'english-science',
      tooltipContent: 'English, Science',
    },
  ],
  size: 'm',
  className: 'test',
};

export const GroupOfSizesOfTags = MultipleTemplate.bind({});
GroupOfSizesOfTags.args = {
  components: [
    {
      tagsList: [
        {tooltipId: 'mathS', label: 'Math S', tooltipContent: 'Math S'},
        {
          label: '+1',
          tooltipId: 'science-englishS',
          icon: {icon: ' fa-solid fa-check', title: 'check', placement: 'left'},
          tooltipContent: (
            <>
              <p>Science S,</p> <p>English S</p>
            </>
          ),
        },
        {
          tooltipId: 'englishS',
          label: 'English S',
          tooltipContent: 'English S',
          icon: {
            icon: ' fa-solid fa-check',
            title: 'check',
            placement: 'right',
          },
        },
      ],
      size: 's',
    },
    {
      tagsList: [
        {tooltipId: 'mathM', label: 'Math M', tooltipContent: 'Math M'},
        {
          label: '+1',
          tooltipId: 'science-englishM',
          icon: {icon: ' fa-solid fa-check', title: 'check', placement: 'left'},
          tooltipContent: (
            <>
              <p>Science M,</p> <p>English M</p>
            </>
          ),
        },
        {
          tooltipId: 'englishM',
          label:
            'English M English M English M English M English M English M English M English M English M',
          tooltipContent: 'English M',
          icon: {
            icon: ' fa-solid fa-check',
            title: 'check',
            placement: 'right',
          },
        },
      ],
      size: 'm',
    },
    {
      tagsList: [
        {tooltipId: 'mathL', label: 'Math L', tooltipContent: 'Math L'},
        {
          label: '+1',
          tooltipId: 'science-englishL',
          icon: {icon: ' fa-solid fa-check', title: 'check', placement: 'left'},
          tooltipContent: (
            <>
              <p>Science L,</p> <p>English L</p>
            </>
          ),
        },
        {
          tooltipId: 'englishL',
          label: 'English L',
          tooltipContent: 'English L',
          icon: {
            icon: ' fa-solid fa-check',
            title: 'check',
            placement: 'right',
          },
        },
      ],
      size: 'l',
    },
  ],
};
