import type {Meta, StoryObj} from '@storybook/react';
import {within, expect} from '@storybook/test';

import Iframe, {IframeProps} from '..';

export default {
  title: 'CMS/Iframe',
  component: Iframe,
} as Meta<IframeProps>;
type Story = StoryObj<typeof Iframe>;

const defaultArgs: IframeProps = {
  title: 'Iframe Title',
  src: 'data:text/html,<h1>Hello, world!</h1>',
};

//
// STORIES
//
export const Playground: Story = {
  args: {
    ...defaultArgs,
  },
  play: ({canvasElement}: {canvasElement: HTMLElement}) => {
    const canvas = within(canvasElement);
    const iFrame: HTMLIFrameElement = canvas.getByTitle(defaultArgs.title);

    expect(iFrame).toBeInTheDocument();
    expect(getComputedStyle(iFrame).border).toBe('0px none rgb(0, 0, 0)');
    expect(iFrame.contentDocument?.body).toBeInTheDocument();
  },
};
