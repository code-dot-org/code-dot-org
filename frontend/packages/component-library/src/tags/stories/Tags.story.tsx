import {Meta, StoryFn} from '@storybook/react-webpack5';
import {useState} from 'react';

import Tags, {Tag, TagProps, TagsProps} from '../index';

export default {
  title: 'DesignSystem/Tags',
  component: Tags,
  parameters: {
    useMui: true,
  },
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
      label: 'Icon left',
      icon: {
        iconName: 'smile',
        iconStyle: 'solid',
        title: 'smile',
        placement: 'left',
      },
      tooltipId: 'science-english',
      tooltipContent: 'Science, English',
    },
    {
      label: 'Icon right',
      icon: {
        iconName: 'smile',
        iconStyle: 'solid',
        title: 'smile',
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
        iconName: 'smile',
        iconStyle: 'solid',
        title: 'smile',
        placement: 'left',
      },
    },
    {
      label: 'Icon right',
      icon: {
        iconName: 'smile',
        iconStyle: 'solid',
        title: 'smile',
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
        iconName: 'smile',
        iconStyle: 'solid',
        title: 'smile',
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
        iconName: 'smile',
        iconStyle: 'solid',
        title: 'smile',
        placement: 'right',
      },
      tooltipId: 'english-science',
      tooltipContent: <>English, Science</>,
    },
  ],
  size: 'm',
  className: 'test',
};

export const TagsWithOnCloseProp: StoryFn<TagsProps> = args => {
  const initialState = ['AAA', 'BBB', 'CCC'];
  const [lightTags, setLightTags] = useState(initialState);
  const [solidTags, setSolidTags] = useState(initialState);
  const [showLightIconClose, setShowLightIconClose] = useState(true);
  const [showSolidIconClose, setShowSolidIconClose] = useState(true);

  const removeTag = (
    setTags: React.Dispatch<React.SetStateAction<string[]>>,
    index: number,
  ) => {
    setTags(prev => {
      const newTags = [...prev];
      newTags.splice(index, 1);
      return newTags;
    });
  };

  const buildTagsList = (
    tags: string[],
    variant: 'light' | 'solid',
  ): TagProps[] =>
    tags.map((label, i) => ({
      label,
      tooltipId: `${variant}-${label}`,
      tooltipContent: label,
      onDelete: () =>
        removeTag(variant === 'light' ? setLightTags : setSolidTags, i),
      variant,
    }));

  return (
    <>
      <p>
        * Margins on this screen does not represent Component's margins, and are
        only added to improve storybook view *{' '}
      </p>
      <div style={{marginTop: 50, display: 'flex', gap: 24}}>
        <div>
          <p>Subtle</p>
          <Tags {...args} tagsList={buildTagsList(lightTags, 'light')} />
          {showLightIconClose && (
            <Tag
              label="Icon + Close"
              tooltipId="light-icon-close"
              tooltipContent="Icon + Close"
              icon={{iconName: 'smile', iconStyle: 'solid', placement: 'right'}}
              onDelete={() => setShowLightIconClose(false)}
              variant="light"
              color="teal"
            />
          )}
        </div>
        <div>
          <p>Solid</p>
          <Tags {...args} tagsList={buildTagsList(solidTags, 'solid')} />
          {showSolidIconClose && (
            <Tag
              label="Icon + Close"
              tooltipId="solid-icon-close"
              tooltipContent="Icon + Close"
              icon={{iconName: 'smile', iconStyle: 'solid', placement: 'right'}}
              onDelete={() => setShowSolidIconClose(false)}
              variant="solid"
              color="teal"
            />
          )}
        </div>
      </div>
      <div style={{marginTop: 50}}>
        <button
          onClick={() => {
            setLightTags(initialState);
            setSolidTags(initialState);
            setShowLightIconClose(true);
            setShowSolidIconClose(true);
          }}
        >
          Reset
        </button>
      </div>
    </>
  );
};

TagsWithOnCloseProp.args = {
  size: 'm',
  className: 'test',
};

export const SingleTagVariants: StoryFn = () => {
  const colors: Array<{
    label: string;
    value:
      | 'teal'
      | 'purple'
      | 'aqua'
      | 'error'
      | 'warning'
      | 'success'
      | 'gray'
      | 'disabled';
  }> = [
    {label: 'Teal', value: 'teal'},
    {label: 'Purple', value: 'purple'},
    {label: 'Aqua', value: 'aqua'},
    {label: 'Error', value: 'error'},
    {label: 'Warning', value: 'warning'},
    {label: 'Success', value: 'success'},
    {label: 'Gray', value: 'gray'},
    {label: 'Disabled', value: 'disabled'},
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 8,
        alignItems: 'start',
        width: '50%',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          justifyItems: 'start',
          alignItems: 'flex-start',
        }}
      >
        <p>Subtle</p>
        {colors.map(color => (
          <Tag
            key={`light-${color.value}`}
            label={color.label}
            color={color.value}
            variant="light"
            icon={{iconName: 'smile', iconStyle: 'solid', placement: 'right'}}
          />
        ))}
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          justifyItems: 'start',
          alignItems: 'flex-start',
        }}
      >
        <p>Solid</p>
        {colors.map(color => (
          <Tag
            key={`solid-${color.value}`}
            label={color.label}
            color={color.value}
            variant="solid"
            icon={{iconName: 'smile', iconStyle: 'solid', placement: 'right'}}
          />
        ))}
      </div>
    </div>
  );
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
            iconName: 'smile',
            iconStyle: 'solid',
            title: 'smile',
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
            title: 'smile',
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
            iconName: 'smile',
            iconStyle: 'solid',
            title: 'smile',
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
            title: 'smile',
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
            iconName: 'smile',
            iconStyle: 'solid',
            title: 'smile',
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
            title: 'smile',
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
