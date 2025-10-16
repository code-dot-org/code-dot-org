import imageFile from '@public/images/image-component.png';
import type {Meta, StoryObj} from '@storybook/react-webpack5';

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
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${components.length % 3 === 0 ? 3 : 2}, 1fr)`,
          gap: '4rem',
        }}
      >
        {components.map((component, index) => (
          <EditorialCard key={index} {...defaultProps} {...component} />
        ))}
      </section>
    );
  },
} as Meta;

const defaultProps: EditorialCardProps = {
  heading: 'EditorialCard Heading',
  text: 'Students can explore their imagination as they design unique, interactive experiences, making game design a powerful tool for artistic expression.',
  media: {
    src: imageFile,
  },
  link: {
    text: 'EditorialCard Link',
    href: 'https://code.org',
    external: true,
  },
};

const withIconProps: EditorialCardProps = {
  ...defaultProps,
  media: {
    iconName: 'smile',
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

export const VerticalWithImage: Story = {
  args: [
    {
      ...defaultProps,
      layout: EDITORIAL_CARD_LAYOUTS.VERTICAL,
    },
    {
      ...defaultProps,
      layout: EDITORIAL_CARD_LAYOUTS.VERTICAL,
    },
    {
      ...defaultProps,
      layout: EDITORIAL_CARD_LAYOUTS.VERTICAL,
    },
  ],
};

export const HorizontalWithImage: Story = {
  args: [
    {
      ...defaultProps,
      layout: EDITORIAL_CARD_LAYOUTS.HORIZONTAL,
    },
    {
      ...defaultProps,
      layout: EDITORIAL_CARD_LAYOUTS.HORIZONTAL,
    },
    {
      ...defaultProps,
      layout: EDITORIAL_CARD_LAYOUTS.HORIZONTAL,
    },
    {
      ...defaultProps,
      layout: EDITORIAL_CARD_LAYOUTS.HORIZONTAL,
    },
  ],
};

export const VerticalWithIcon: Story = {
  args: [
    {
      ...withIconProps,
      layout: EDITORIAL_CARD_LAYOUTS.VERTICAL,
    },
    {
      ...withIconProps,
      layout: EDITORIAL_CARD_LAYOUTS.VERTICAL,
    },
    {
      ...withIconProps,
      layout: EDITORIAL_CARD_LAYOUTS.VERTICAL,
    },
  ],
};
