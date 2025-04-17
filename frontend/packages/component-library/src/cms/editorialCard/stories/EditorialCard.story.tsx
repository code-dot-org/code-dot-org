import imageFile from '@public/images/image-component.png';
import type {Meta, StoryObj} from '@storybook/react';

import EditorialCard, {
  EDITORIAL_CARD_LAYOUTS,
  EditorialCardProps,
} from './../EditorialCard';

type Story = StoryObj<EditorialCardProps | EditorialCardProps[]>;

export default {
  title: 'CMS/EditorialCard',
  component: EditorialCard,
  render: args => {
    const components: EditorialCardProps[] = args[0]
      ? Object.values(args)
      : [args];
    return (
      <>
        {components.map((component, index) => (
          <section key={index} style={{width: '27rem', marginBottom: '2rem'}}>
            <EditorialCard {...defaultProps} {...component} />
          </section>
        ))}
      </>
    );
  },
} as Meta;

const defaultProps: EditorialCardProps = {
  heading: 'EditorialCard Heading',
  text:
    'Students can explore their imagination as ' +
    'they design unique, interactive experiences,\n' +
    'making game design a powerful tool for ' +
    'artistic expression.',
  media: {
    src: imageFile,
  },
  link: {
    text: 'EditorialCard Link',
    href: 'https://code.org',
    external: true,
  },
};

//
// STORIES
//
export const Playground: Story = {
  args: {
    ...defaultProps,
  },
};

export const Layouts: Story = {
  args: [
    {
      ...defaultProps,
      heading: 'Horizontal EditorialCard',
      layout: EDITORIAL_CARD_LAYOUTS.HORIZONTAL,
    },
    {
      ...defaultProps,
      heading: 'Vertical EditorialCard',
      layout: EDITORIAL_CARD_LAYOUTS.VERTICAL,
    },
  ],
};

export const WithIcon: Story = {
  args: [
    {
      ...defaultProps,
      heading: 'Horizontal EditorialCard',
      layout: EDITORIAL_CARD_LAYOUTS.HORIZONTAL,
      media: {
        iconName: 'smile',
      },
    },
    {
      ...defaultProps,
      heading: 'Vertical EditorialCard',
      layout: EDITORIAL_CARD_LAYOUTS.VERTICAL,
      media: {
        iconName: 'smile',
      },
    },
  ],
};
