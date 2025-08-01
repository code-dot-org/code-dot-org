import type {Meta, StoryObj} from '@storybook/nextjs-vite';

import Paragraph from '../Paragraph';

const meta: Meta<typeof Paragraph> = {
  title: 'Marketing/Paragraph',
  component: Paragraph,
  tags: ['autodocs', 'marketing'],
};
export default meta;
type Story = StoryObj<typeof Paragraph>;

export const Variants: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      <Paragraph
        visualAppearance="body-one"
        isStrong={false}
        color="primary"
        removeMarginBottom={false}
      >
        Body One Paragraph
      </Paragraph>
      <Paragraph
        visualAppearance="body-two"
        isStrong={false}
        color="secondary"
        removeMarginBottom={false}
      >
        Body Two Paragraph
      </Paragraph>
      <Paragraph
        visualAppearance="body-three"
        isStrong={false}
        color="primary"
        removeMarginBottom={false}
      >
        Body Three Paragraph
      </Paragraph>
      <Paragraph
        visualAppearance="body-four"
        isStrong={false}
        color="secondary"
        removeMarginBottom={false}
      >
        Body Four Paragraph
      </Paragraph>
      <Paragraph
        visualAppearance="body-one"
        isStrong={true}
        color="primary"
        removeMarginBottom={false}
      >
        Strong Body One Paragraph
      </Paragraph>
    </div>
  ),
};

export const Playground: Story = {
  args: {
    children:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, urna eu tincidunt consectetur, nisi nisl aliquam enim, vitae facilisis sapien enim nec urna. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Integer ac sem nec urna cursus dictum. Etiam euismod, velit eu facilisis cursus, enim erat dictum urna, nec dictum massa erat nec enim. Mauris ac sapien vitae erat cursus dictum.',
    visualAppearance: 'body-one',
    isStrong: false,
    color: 'primary',
    removeMarginBottom: false,
    className: '',
  },
  argTypes: {
    children: {control: 'text'},
    visualAppearance: {
      control: {type: 'select'},
      options: ['body-one', 'body-two', 'body-three', 'body-four'],
    },
    isStrong: {control: 'boolean'},
    color: {
      control: {type: 'select'},
      options: ['primary', 'secondary'],
    },
    removeMarginBottom: {control: 'boolean'},
    className: {control: 'text'},
  },
};
