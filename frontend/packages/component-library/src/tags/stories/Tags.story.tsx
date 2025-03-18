import {Meta, StoryFn} from '@storybook/react';

import Tags, {TagsProps} from '../index';

export default {
  title: 'DesignSystem/Tags',
  component: Tags,
} as Meta;

//
// TEMPLATE
//
//  Using marginTop to separate components in storybook and prevent tooltip from hiding under the Storybook HUD.
const SingleTemplate: StoryFn<TagsProps> = args => (
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

const MultipleTemplate: StoryFn<{
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
      icon: {
        iconName: 'check',
        iconStyle: 'solid',
        title: 'check',
        placement: 'left',
      },
      tooltipId: 'science-english',
      tooltipContent: 'Science, English',
    },
    {
      label: '+1',
      icon: {
        iconName: 'check',
        iconStyle: 'solid',
        title: 'check',
        placement: 'right',
      },
      tooltipId: 'english-science',
      tooltipContent: 'English, Science',
    },
  ],
  size: 'm',
  className: 'test',
};

export const NoTooltipTags = SingleTemplate.bind({});
NoTooltipTags.args = {
  tagsList: [
    {label: 'Math'},
    {
      label: '+1',
      icon: {
        iconName: 'check',
        iconStyle: 'solid',
        title: 'check',
        placement: 'left',
      },
    },
    {
      label: '+1',
      icon: {
        iconName: 'check',
        iconStyle: 'solid',
        title: 'check',
        placement: 'right',
      },
    },
  ],
  size: 'm',
  className: 'test',
};

export const TagsWithHTMLTooltipContent = SingleTemplate.bind({});
TagsWithHTMLTooltipContent.args = {
  tagsList: [
    {tooltipId: 'math', label: 'Math', tooltipContent: <>Math</>},
    {
      label: '+1',
      icon: {
        iconName: 'check',
        iconStyle: 'solid',
        title: 'check',
        placement: 'left',
      },
      tooltipId: 'science-english',
      tooltipContent: (
        <>
          <p>Science,</p> <p>English</p>
        </>
      ),
    },
    {
      label: '+1',
      icon: {
        iconName: 'check',
        iconStyle: 'solid',
        title: 'check',
        placement: 'right',
      },
      tooltipId: 'english-science',
      tooltipContent: <>English, Science</>,
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
          icon: {
            iconName: 'check',
            iconStyle: 'solid',
            title: 'check',
            placement: 'left',
          },
          tooltipContent: 'Science S, English S',
        },
        {
          tooltipId: 'englishS',
          label: 'Tags',
          tooltipContent: 'English S',
          icon: {
            iconName: 'circle-user',
            iconStyle: 'solid',
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
          icon: {
            iconName: 'check',
            iconStyle: 'solid',
            title: 'check',
            placement: 'left',
          },
          tooltipContent: 'Science M, English M',
        },
        {
          tooltipId: 'englishM',
          label: 'Tags',
          tooltipContent: 'English M',
          icon: {
            iconName: 'circle-user',
            iconStyle: 'solid',
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
          icon: {
            iconName: 'check',
            iconStyle: 'solid',
            title: 'check',
            placement: 'left',
          },
          tooltipContent: 'Science L, English L',
        },
        {
          tooltipId: 'englishL',
          label: 'Tags',
          tooltipContent: 'English L',
          icon: {
            iconName: 'circle-user',
            iconStyle: 'solid',
            title: 'check',
            placement: 'right',
          },
        },
      ],
      size: 'l',
    },
  ],
};
