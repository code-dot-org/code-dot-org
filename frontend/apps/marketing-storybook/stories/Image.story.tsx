import Image from '@/components/contentful/image';
import type {Meta, StoryObj} from '@storybook/nextjs-vite';
import {expect} from 'storybook/test';

const meta: Meta<typeof Image> = {
  title: 'Marketing/Image',
  component: Image,
  tags: ['autodocs', 'marketing'],
};
export default meta;
type Story = StoryObj<typeof Image>;

export const Playground: Story = {
  args: {
    src: '//contentful-images.code.org/90t6bu6vlf76/6fdNRFZbNXpiXQd6v7fHen/d6328a3a965b3daca5fb0375caf72064/image-component.png',
    altText: 'Playground Image (Base64 Triangle)',
    decoration: 'none',
    hasRoundedCorners: false,
    className: '',
  },
  argTypes: {
    src: {control: 'text'},
    altText: {control: 'text'},
    decoration: {control: 'select', options: ['none', 'border', 'shadow']},
    hasRoundedCorners: {control: 'boolean'},
    className: {control: 'text'},
  },
};

export const FilledOut: Story = {
  args: {
    className: 'cf-4500335a80dc2459d279a4787321e012',
    src: '//contentful-images.code.org/90t6bu6vlf76/6fdNRFZbNXpiXQd6v7fHen/d6328a3a965b3daca5fb0375caf72064/image-component.png',
    altText: '',
    decoration: 'none',
    hasRoundedCorners: true,
  },
  play: async ({canvas}) => {
    const figure = canvas.getByRole('figure');
    const img = figure.querySelector('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute(
      'src',
      expect.stringContaining('image-component.png'),
    );
    expect(img).toHaveAttribute('alt', '');
  },
};

export const WithoutRoundedCorners: Story = {
  args: {
    className: 'cf-2ba31a7748dfbcd6c497b2c48ade5eb6',
    src: '//contentful-images.code.org/90t6bu6vlf76/6fdNRFZbNXpiXQd6v7fHen/d6328a3a965b3daca5fb0375caf72064/image-component.png',
    altText: 'Image without rounded corners',
    decoration: 'none',
    hasRoundedCorners: false,
  },
  play: async ({canvas}) => {
    const figure = canvas.getByRole('figure');
    const img = figure.querySelector('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('alt', 'Image without rounded corners');
  },
};

export const WithBorder: Story = {
  args: {
    className: 'cf-3d97cf1703c2fa8520d52b3b271f20a4',
    src: '//contentful-images.code.org/90t6bu6vlf76/6fdNRFZbNXpiXQd6v7fHen/d6328a3a965b3daca5fb0375caf72064/image-component.png',
    altText: 'Image with border',
    decoration: 'border',
    hasRoundedCorners: true,
    children: null,
  },
  play: async ({canvas}) => {
    const figure = canvas.getByRole('figure');
    const img = figure.querySelector('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('alt', 'Image with border');
  },
};

export const WithShadow: Story = {
  args: {
    className: 'cf-f0a196a6bd346ac539b9c352426325d9',
    src: '//contentful-images.code.org/90t6bu6vlf76/6fdNRFZbNXpiXQd6v7fHen/d6328a3a965b3daca5fb0375caf72064/image-component.png',
    altText: 'Image with shadow',
    decoration: 'shadow',
    hasRoundedCorners: true,
    children: null,
  },
  play: async ({canvas}) => {
    const figure = canvas.getByRole('figure');
    const img = figure.querySelector('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('alt', 'Image with shadow');
  },
};
