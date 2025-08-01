import type {Meta, StoryObj} from '@storybook/nextjs-vite';
import {expect} from 'storybook/test';

import Link from '../Link';

const meta: Meta<typeof Link> = {
  title: 'Marketing/Link',
  component: Link,
  tags: ['autodocs', 'marketing'],
};
export default meta;
type Story = StoryObj<typeof Link>;

const sizes = ['xs', 's', 'm', 'l'] as const;
const colors = ['primary', 'white'] as const;
const isLinkExternals = [false, true] as const;
const removeMarginBottoms = [false, true] as const;

export const Playground: Story = {
  args: {
    href: 'about:blank',
    children: 'Playground Link',
    color: 'primary',
    size: 'm',
    isLinkExternal: false,
    removeMarginBottom: false,
    ariaLabel: '',
    className: '',
  },
  argTypes: {
    href: {control: 'text'},
    children: {control: 'text'},
    color: {control: 'select', options: colors},
    size: {control: 'select', options: sizes},
    isLinkExternal: {control: 'boolean'},
    removeMarginBottom: {control: 'boolean'},
    ariaLabel: {control: 'text'},
    className: {control: 'text'},
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function testLinkMatrix(canvas: any, size: string, color: string) {
  for (const isLinkExternal of isLinkExternals) {
    for (const removeMarginBottom of removeMarginBottoms) {
      const linkText = `Link | size: ${size} | color: ${color} | external: ${isLinkExternal} | removeMarginBottom: ${removeMarginBottom}`;
      const link = canvas.getByRole('link', {name: linkText});
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', 'about:blank');
      if (isLinkExternal) {
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
        expect(link.querySelector('svg')).toBeInTheDocument();
      } else {
        expect(link).not.toHaveAttribute('target');
        expect(link).not.toHaveAttribute('rel');
        expect(link.querySelector('svg')).not.toBeInTheDocument();
      }
    }
  }
}

export const LinkXSPrimary: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      {isLinkExternals
        .map(isLinkExternal =>
          removeMarginBottoms.map(removeMarginBottom => (
            <Link
              key={`xs-primary-${isLinkExternal}-${removeMarginBottom}`}
              href="about:blank"
              size="xs"
              color="primary"
              isLinkExternal={isLinkExternal}
              removeMarginBottom={removeMarginBottom}
            >
              {`Link | size: xs | color: primary | external: ${isLinkExternal} | removeMarginBottom: ${removeMarginBottom}`}
            </Link>
          )),
        )
        .flat()}
    </div>
  ),
  play: async ({canvas}) => {
    testLinkMatrix(canvas, 'xs', 'primary');
  },
};

export const LinkXSWhite: Story = {
  globals: {
    backgrounds: {value: 'dark'},
  },
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      {isLinkExternals
        .map(isLinkExternal =>
          removeMarginBottoms.map(removeMarginBottom => (
            <Link
              key={`xs-white-${isLinkExternal}-${removeMarginBottom}`}
              href="about:blank"
              size="xs"
              color="white"
              isLinkExternal={isLinkExternal}
              removeMarginBottom={removeMarginBottom}
            >
              {`Link | size: xs | color: white | external: ${isLinkExternal} | removeMarginBottom: ${removeMarginBottom}`}
            </Link>
          )),
        )
        .flat()}
    </div>
  ),
  play: async ({canvas}) => {
    testLinkMatrix(canvas, 'xs', 'white');
  },
};

export const LinkSPrimary: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      {isLinkExternals
        .map(isLinkExternal =>
          removeMarginBottoms.map(removeMarginBottom => (
            <Link
              key={`s-primary-${isLinkExternal}-${removeMarginBottom}`}
              href="about:blank"
              size="s"
              color="primary"
              isLinkExternal={isLinkExternal}
              removeMarginBottom={removeMarginBottom}
            >
              {`Link | size: s | color: primary | external: ${isLinkExternal} | removeMarginBottom: ${removeMarginBottom}`}
            </Link>
          )),
        )
        .flat()}
    </div>
  ),
  play: async ({canvas}) => {
    testLinkMatrix(canvas, 's', 'primary');
  },
};

export const LinkSWhite: Story = {
  globals: {
    backgrounds: {value: 'dark'},
  },
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      {isLinkExternals
        .map(isLinkExternal =>
          removeMarginBottoms.map(removeMarginBottom => (
            <Link
              key={`s-white-${isLinkExternal}-${removeMarginBottom}`}
              href="about:blank"
              size="s"
              color="white"
              isLinkExternal={isLinkExternal}
              removeMarginBottom={removeMarginBottom}
            >
              {`Link | size: s | color: white | external: ${isLinkExternal} | removeMarginBottom: ${removeMarginBottom}`}
            </Link>
          )),
        )
        .flat()}
    </div>
  ),
  play: async ({canvas}) => {
    testLinkMatrix(canvas, 's', 'white');
  },
};

export const LinkMPrimary: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      {isLinkExternals
        .map(isLinkExternal =>
          removeMarginBottoms.map(removeMarginBottom => (
            <Link
              key={`m-primary-${isLinkExternal}-${removeMarginBottom}`}
              href="about:blank"
              size="m"
              color="primary"
              isLinkExternal={isLinkExternal}
              removeMarginBottom={removeMarginBottom}
            >
              {`Link | size: m | color: primary | external: ${isLinkExternal} | removeMarginBottom: ${removeMarginBottom}`}
            </Link>
          )),
        )
        .flat()}
    </div>
  ),
  play: async ({canvas}) => {
    testLinkMatrix(canvas, 'm', 'primary');
  },
};

export const LinkMWhite: Story = {
  globals: {
    backgrounds: {value: 'dark'},
  },
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      {isLinkExternals
        .map(isLinkExternal =>
          removeMarginBottoms.map(removeMarginBottom => (
            <Link
              key={`m-white-${isLinkExternal}-${removeMarginBottom}`}
              href="about:blank"
              size="m"
              color="white"
              isLinkExternal={isLinkExternal}
              removeMarginBottom={removeMarginBottom}
            >
              {`Link | size: m | color: white | external: ${isLinkExternal} | removeMarginBottom: ${removeMarginBottom}`}
            </Link>
          )),
        )
        .flat()}
    </div>
  ),
  play: async ({canvas}) => {
    testLinkMatrix(canvas, 'm', 'white');
  },
};

export const LinkLPrimary: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      {isLinkExternals
        .map(isLinkExternal =>
          removeMarginBottoms.map(removeMarginBottom => (
            <Link
              key={`l-primary-${isLinkExternal}-${removeMarginBottom}`}
              href="about:blank"
              size="l"
              color="primary"
              isLinkExternal={isLinkExternal}
              removeMarginBottom={removeMarginBottom}
            >
              {`Link | size: l | color: primary | external: ${isLinkExternal} | removeMarginBottom: ${removeMarginBottom}`}
            </Link>
          )),
        )
        .flat()}
    </div>
  ),
  play: async ({canvas}) => {
    testLinkMatrix(canvas, 'l', 'primary');
  },
};

export const LinkLWhite: Story = {
  globals: {
    backgrounds: {value: 'dark'},
  },
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      {isLinkExternals
        .map(isLinkExternal =>
          removeMarginBottoms.map(removeMarginBottom => (
            <Link
              key={`l-white-${isLinkExternal}-${removeMarginBottom}`}
              href="about:blank"
              size="l"
              color="white"
              isLinkExternal={isLinkExternal}
              removeMarginBottom={removeMarginBottom}
            >
              {`Link | size: l | color: white | external: ${isLinkExternal} | removeMarginBottom: ${removeMarginBottom}`}
            </Link>
          )),
        )
        .flat()}
    </div>
  ),
  play: async ({canvas}) => {
    testLinkMatrix(canvas, 'l', 'white');
  },
};
