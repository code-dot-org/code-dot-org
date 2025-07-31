import type {Meta, StoryObj} from '@storybook/nextjs-vite';

import Link from '../Link';

const meta: Meta<typeof Link> = {
  title: 'Marketing/Link',
  component: Link,
  tags: ['autodocs', 'marketing'],
};
export default meta;
type Story = StoryObj<typeof Link>;

const createStory = (theme: string) => ({
  globals: {theme},
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      <Link
        href="about:blank"
        removeMarginBottom={false}
        size={'s'}
        isLinkExternal={false}
      >
        Default Link
      </Link>
      <Link
        href="about:blank"
        color="white"
        removeMarginBottom={false}
        size={'m'}
        isLinkExternal={true}
      >
        Secondary Link
      </Link>
    </div>
  ),
});

export const CDOVariants = createStory('code.org');
export const CSForAllVariants = createStory('csforall');

export const Playground: Story = {
  args: {
    href: 'about:blank',
    children: 'Playground Link',
    color: 'primary',
  },
};
