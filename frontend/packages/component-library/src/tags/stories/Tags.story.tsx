import {Meta, StoryFn} from '@storybook/react';

import Tags, {TagProps, TagsProps} from '../index';
import {useState} from 'react';

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

const SingleTemplateWithTagState: StoryFn<TagsProps> = args => {
  const initialState = ['AAA', 'BBB', 'CCC'];
  const [tags, setTags] = useState(initialState);

  const removeTag = (index: number) => {
    setTags(prev => {
      const newTags = [...prev];
      newTags.splice(index, 1);
      return newTags;
    });
  };

  const tagsList: TagProps[] = tags.map((label, i) => ({
    label,
    tooltipId: label,
    tooltipContent: label,
    onClose: () => removeTag(i),
    type: 'closable',
  }));

  return (
    <>
      <p>
        * Margins on this screen does not represent Component's margins, and are
        only added to improve storybook view *{' '}
      </p>
      <div style={{marginTop: 50}}>
        <Tags {...args} tagsList={tagsList} />
      </div>
      <div style={{marginTop: 50}}>
        <button onClick={() => setTags(initialState)}>Reset</button>
      </div>
    </>
  );
};

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
      label: 'Icon left',
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
      label: 'Icon right',
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
      label: 'Icon left',
      icon: {
        iconName: 'check',
        iconStyle: 'solid',
        title: 'check',
        placement: 'left',
      },
    },
    {
      label: 'Icon right',
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
      label: 'Icon left',
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
      label: 'Icon right',
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

export const TagsWithOnCloseProp = SingleTemplateWithTagState.bind({});
TagsWithOnCloseProp.args = {
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
          label: 'Science English S',
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
          label: 'English S',
          tooltipContent: 'English S',
          icon: {
            iconName: 'circle-user',
            iconStyle: 'solid',
            title: 'check',
            placement: 'right',
          },
        },
        {
          tooltipId: 'closeS',
          label: 'Close',
          tooltipContent: 'Close S',
          onClose: () => {},
          type: 'closable',
        },
      ],
      size: 's',
    },
    {
      tagsList: [
        {tooltipId: 'mathM', label: 'Math M', tooltipContent: 'Math M'},
        {
          label: 'Science english M',
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
          label: 'English M',
          tooltipContent: 'English M',
          icon: {
            iconName: 'circle-user',
            iconStyle: 'solid',
            title: 'check',
            placement: 'right',
          },
        },
        {
          tooltipId: 'closeM',
          label: 'Close',
          tooltipContent: 'Close M',
          onClose: () => {},
          type: 'closable',
        },
      ],
      size: 'm',
    },
    {
      tagsList: [
        {tooltipId: 'mathL', label: 'Math L', tooltipContent: 'Math L'},
        {
          label: 'Science English L',
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
          label: 'English L',
          tooltipContent: 'English L',
          icon: {
            iconName: 'circle-user',
            iconStyle: 'solid',
            title: 'check',
            placement: 'right',
          },
        },
        {
          tooltipId: 'closeL',
          label: 'Close',
          tooltipContent: 'Close L',
          onClose: () => {},
          type: 'closable',
        },
      ],
      size: 'l',
    },
  ],
};
