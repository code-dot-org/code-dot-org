import Card from '@/components/contentful/card';
import type {Meta, StoryObj} from '@storybook/react';
import {expect} from 'storybook/test';

const meta: Meta<typeof Card> = {
  title: 'Marketing/Card',
  component: Card,
  tags: ['autodocs', 'marketing'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const defaultArgs = {
  title: 'Card Title',
  description: 'Card Description',
  imageSrc:
    '//contentful-images.code.org/90t6bu6vlf76/6fdNRFZbNXpiXQd6v7fHen/d6328a3a965b3daca5fb0375caf72064/image-component.png',
  imageHeight: '300',
  overline: 'Card Overline',
  primaryButton: {
    fields: {
      label: 'Primary Action',
      primaryTarget: 'https://example.com/primary',
      ariaLabel: 'Primary Action Link',
      isThisAnExternalLink: false,
    },
  } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
  secondaryButton: {
    fields: {
      label: 'Secondary Action',
      primaryTarget: 'https://example.com/secondary',
      ariaLabel: 'Secondary Action Link',
      isThisAnExternalLink: true,
    },
  } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
};

export const Default: Story = {
  args: {
    ...defaultArgs,
  },
  play: async ({canvas}) => {
    const cardTitle = canvas.getByText('Card Title');
    await expect(cardTitle).toBeInTheDocument();

    const linkElements = canvas.getAllByRole('link');
    await expect(linkElements).toHaveLength(2);
  },
};

export const CustomImageHeight: Story = {
  args: {
    ...defaultArgs,
    imageHeight: '700',
  },
  play: async ({canvas}) => {
    const cardTitle = canvas.getByText('Card Title');
    await expect(cardTitle).toBeInTheDocument();

    const imageElement = canvas.getByAltText('Card Title');
    await expect(imageElement).toBeInTheDocument();
  },
};

export const GridLayout: Story = {
  render: () => (
    <section
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '24px',
        maxWidth: '1200px',
      }}
    >
      <Card {...defaultArgs} title="Card 1" />
      <Card {...defaultArgs} title="Card 2" />
      <Card {...defaultArgs} title="Card 3" />
      <Card {...defaultArgs} title="Card 4" />
    </section>
  ),
  play: async ({canvas}) => {
    const cardTitles = canvas.getAllByText(/Card [1-4]/);
    await expect(cardTitles).toHaveLength(4);
  },
};
