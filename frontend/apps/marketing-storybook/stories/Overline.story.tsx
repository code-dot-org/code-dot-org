import Overline from '@/components/contentful/overline';
import type {Meta, StoryObj} from '@storybook/nextjs-vite';

const meta: Meta<typeof Overline> = {
  title: 'Marketing/Overline',
  component: Overline,
  tags: ['autodocs', 'marketing'],
};
export default meta;
type Story = StoryObj<typeof Overline>;

export const Playground: Story = {
  args: {
    children: 'Playground Overline',
    size: 'm',
    color: 'primary',
    removeMarginBottom: false,
    className: '',
  },
  argTypes: {
    children: {control: 'text'},
    size: {control: 'select', options: ['m', 'l']},
    color: {control: 'select', options: ['primary', 'secondary', 'white']},
    removeMarginBottom: {control: 'boolean'},
    className: {control: 'text'},
  },
};

export const PrimaryMedium: Story = {
  args: {
    className: 'cf-14b792a2ed12f388fc1770f70ae461d4',
    children: 'Overline Primary Medium',
    color: 'primary',
    size: 'm',
    removeMarginBottom: false,
  },
};

export const SecondarySmall: Story = {
  args: {
    className: 'cf-28610d248e1f0e85cc6e5aa7f3db7332',
    children: 'Overline Secondary Small',
    color: 'secondary',
    size: 's',
    removeMarginBottom: false,
  },
};

export const PrimaryLarge: Story = {
  args: {
    className: 'cf-c93a06c0d95b21ebb4a12532e1404ea6',
    children: 'Overline Primary Large',
    color: 'primary',
    size: 'l',
    removeMarginBottom: false,
  },
};
