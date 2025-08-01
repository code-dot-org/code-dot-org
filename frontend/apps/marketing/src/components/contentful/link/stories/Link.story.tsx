import type {Meta, StoryObj} from '@storybook/nextjs-vite';

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

export const Variants: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      {sizes
        .map(size =>
          colors.map(color =>
            isLinkExternals.map(isLinkExternal =>
              removeMarginBottoms.map(removeMarginBottom => (
                <div
                  key={`${size}-${color}-${removeMarginBottom}-${isLinkExternal}`}
                  style={
                    color === 'white' ? {background: '#333', padding: 8} : {}
                  }
                >
                  <Link
                    key={`${size}-${color}-${isLinkExternal}-${removeMarginBottom}`}
                    href="about:blank"
                    size={size}
                    color={color}
                    isLinkExternal={isLinkExternal}
                    removeMarginBottom={removeMarginBottom}
                  >
                    {`Link | size: ${size} | color: ${color} | external: ${isLinkExternal} | removeMarginBottom: ${removeMarginBottom}`}
                  </Link>
                </div>
              )),
            ),
          ),
        )
        .flat(3)}
    </div>
  ),
};

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
