import type {Meta, StoryObj} from '@storybook/nextjs-vite';

import Button from '../Button';

const meta: Meta<typeof Button> = {
  title: 'Marketing/MuiButton',
  component: Button,
  tags: ['autodocs', 'marketing'],
  argTypes: {
    type: {
      control: {type: 'select'},
      options: ['emphasized', 'primary', 'secondary', 'white'],
    },
    size: {
      control: {type: 'select'},
      options: ['small', 'medium', 'large'],
    },
    isLinkExternal: {control: 'boolean'},
    text: {control: 'text'},
    href: {control: 'text'},
    ariaLabel: {control: 'text'},
    className: {control: 'text'},
  },
};
export default meta;
type Story = StoryObj<typeof Button>;

const createStory = (theme: string) => {
  const Story: Story = {
    globals: {theme},
    render: () => (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          alignItems: 'start',
        }}
      >
        <Button
          text="Emphasized"
          type="emphasized"
          size="medium"
          href="about:blank"
          isLinkExternal={false}
        />
        <Button
          text="Primary"
          type="primary"
          size="medium"
          href="about:blank"
          isLinkExternal={false}
        />
        <Button
          text="Secondary"
          type="secondary"
          size="medium"
          href="about:blank"
          isLinkExternal={false}
        />
        <Button
          text="White"
          type="white"
          size="medium"
          href="about:blank"
          isLinkExternal={false}
        />
        <Button
          text="External Link"
          type="primary"
          size="medium"
          href="about:blank"
          isLinkExternal={true}
        />
      </div>
    ),
  };

  return Story;
};

export const Playground: Story = {
  args: {
    text: 'Playground Button',
    type: 'primary',
    size: 'medium',
    href: 'about:blank',
    isLinkExternal: false,
    ariaLabel: '',
    className: '',
  },
};

export const Variants = createStory('csforall');
