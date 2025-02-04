import type {Meta, StoryObj} from '@storybook/react';
import {within, expect} from '@storybook/test';

import Divider, {DividerProps} from '../index';

export default {
  title: 'DesignSystem/Divider',
  component: Divider,
} as Meta;
type Story = StoryObj<typeof Divider>;

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
  components: DividerProps[];
}> = {
  render: args => (
    <>
      <p>
        {args.components.some(componentArg => componentArg.margin)
          ? '* Gray background exists to show spacing, it will not appear with component *'
          : "* Margins on this screen do not represent Component's margins, and are only added to improve storybook view *"}
      </p>

      <p>Multiple Dividers:</p>
      <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
        {args.components?.map((componentArg, index) => (
          <div
            key={index}
            style={{
              background: componentArg.margin ? '#646464' : 'none',
            }}
          >
            <Divider {...componentArg} />
          </div>
        ))}
      </div>
    </>
  ),
};

export const GroupOfDividers: StoryObj<{
  components: DividerProps[];
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
  components: DividerProps[];
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
