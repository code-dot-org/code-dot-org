import type {Meta, StoryObj} from '@storybook/react-vite';
import {within, expect} from 'storybook/test';

import {MuiDivider, MuiDividerProps} from '../index';

import styles from './muiDividerStory.module.scss';

export default {
  title: 'DesignSystem/Divider/MuiDivider',
  component: MuiDivider,
} as Meta;
type Story = StoryObj<typeof MuiDivider>;

//
// TEMPLATE
//
export const DefaultDivider: Story = {
  args: {
    color: 'primary',
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const divider = canvas.getByRole('separator');
    const expectedColor = window
      .getComputedStyle(document.body)
      .getPropertyValue('--background-neutral-quaternary');

    // applies the primary color class by default
    expect(divider).toHaveStyle(`border-top-color: ${expectedColor};`);

    // applies the no margin class by default
    expect(divider).toHaveStyle('margin: 0');
  },
};

const MultipleTemplate: StoryObj<{
  components: MuiDividerProps[];
}> = {
  render: args => (
    <>
      <div className={styles.dividerColumn}>
        {args.components?.map((componentArg, index) => (
          <div
            key={index}
            className={componentArg.margin ? styles.marginBox : undefined}
          >
            <MuiDivider {...componentArg} />
          </div>
        ))}
      </div>
    </>
  ),
};

export const GroupOfDividers: StoryObj<{
  components: MuiDividerProps[];
}> = {
  ...MultipleTemplate,
  args: {
    components: [{color: 'primary'}, {color: 'strong'}],
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const dividers = canvas.getAllByRole('separator');
    const getComputedStyleValue = (property: string) =>
      window.getComputedStyle(document.body).getPropertyValue(property);

    const primary = getComputedStyleValue('--background-neutral-quaternary');
    const strong = getComputedStyleValue('--background-neutral-senary');

    expect(dividers[0]).toHaveStyle(`border-top-color: ${primary};`);
    expect(dividers[1]).toHaveStyle(`border-top-color: ${strong};`);
  },
};

export const GroupOfDividersWithMargin: StoryObj<{
  components: MuiDividerProps[];
}> = {
  ...MultipleTemplate,
  args: {
    components: [
      {color: 'primary', margin: 'none'},
      {color: 'primary', margin: 'xs'},
      {color: 'primary', margin: 's'},
      {color: 'primary', margin: 'm'},
      {color: 'primary', margin: 'l'},
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Gray background exists to show margin, it will not appear with component.',
      },
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const dividers = await canvas.getAllByRole('separator');
    const expectedColor = window
      .getComputedStyle(document.body)
      .getPropertyValue('--background-neutral-quaternary');
    dividers.forEach(divider => {
      // applies the primary color class by default
      expect(divider).toHaveStyle(`border-top-color: ${expectedColor};`);
      // applies a margin
      if (dividers.indexOf(divider) !== 0) {
        expect(divider).not.toHaveStyle('margin: 0');
      }
    });
  },
};
