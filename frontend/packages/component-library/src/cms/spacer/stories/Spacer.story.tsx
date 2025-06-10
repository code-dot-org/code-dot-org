import type {Meta, StoryObj} from '@storybook/react';
import {within, expect} from '@storybook/test';

import Spacer, {SpacerProps} from './../Spacer';

type Story = StoryObj<SpacerProps | SpacerProps[]>;

export default {
  title: 'CMS/Spacer',
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
            {component.size ? (
              <h5>Size {component.size.toUpperCase()}</h5>
            ) : (
              <br />
            )}

            <div style={{background: '#E4E6E9'}}>
              <Spacer key={index} {...component} />
            </div>
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
  args: {},
  play: ({canvasElement}: {canvasElement: HTMLElement}) => {
    const spacer = within(canvasElement).getByRole('presentation');
    expect(getComputedStyle(spacer).height).toBe('32px');
  },
};

export const Sizes: Story = {
  args: [{size: 'xs'}, {size: 's'}, {size: 'm'}, {size: 'l'}],
  play: ({canvasElement}: {canvasElement: HTMLElement}) => {
    const spacers = within(canvasElement).getAllByRole('presentation');
    expect(getComputedStyle(spacers[0]).height).toBe('8px');
    expect(getComputedStyle(spacers[1]).height).toBe('16px');
    expect(getComputedStyle(spacers[2]).height).toBe('32px');
    expect(getComputedStyle(spacers[3]).height).toBe('64px');
  },
};
