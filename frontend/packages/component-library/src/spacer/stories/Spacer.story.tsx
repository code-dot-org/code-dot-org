import type {Meta, StoryObj} from '@storybook/react';
import {within, expect} from '@storybook/test';

import Spacer, {SpacerProps} from '..';

type Story = StoryObj<SpacerProps | SpacerProps[]>;

export default {
  title: 'DesignSystem/Spacer',
  component: Spacer,
  render: args => {
    const components: SpacerProps[] = args[0] ? Object.values(args) : [args];
    return (
      <>
        <small>
          Background fill is for display purposes only, component has no styling
          properties except for height.
        </small>

        {components.map((component, index) => (
          <section>
            {component.title ? <h5>{component.title}</h5> : <br />}
            <Spacer
              key={index}
              style={{background: '#E4E6E9'}}
              {...component}
            />
          </section>
        ))}
      </>
    );
  },
} as Meta;

//
// STORIES
//
export const Playground: Story = {
  args: {role: 'separator'},
  play: ({canvasElement}: {canvasElement: HTMLElement}) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole('separator')).toHaveStyle('height: 32px');
  },
};

export const Sizes: Story = {
  args: [
    {size: 'xs', title: 'Size XS - 8px (0.5rem)'},
    {size: 's', title: 'Size S - 16px (1rem)'},
    {size: 'm', title: 'Size M - 32px (2rem)'},
    {size: 'l', title: 'Size L - 64px (4rem)'},
  ],
  play: ({canvasElement}: {canvasElement: HTMLElement}) => {
    const canvas = within(canvasElement);
    expect(canvas.getByTitle(/Size XS/)).toHaveStyle('height: 8px');
    expect(canvas.getByTitle(/Size S /)).toHaveStyle('height: 16px');
    expect(canvas.getByTitle(/Size M /)).toHaveStyle('height: 32px');
    expect(canvas.getByTitle(/Size L /)).toHaveStyle('height: 64px');
  },
};
