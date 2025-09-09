import type {Meta, StoryObj} from '@storybook/react-webpack5';
import {within, expect} from 'storybook/test';

import IconHighlight, {IconHighlightProps} from '..';

type Story = StoryObj<typeof IconHighlight>;

export default {
  title: 'CMS/Icon Highlight',
  component: IconHighlight,
} as Meta<IconHighlightProps>;

const defaultArgs: IconHighlightProps = {
  heading: 'IconHighlight Heading',
  text: 'IconHighlight\nMultiline Text',
  icon: {iconName: 'message'},
};

const getComputedStylePropValue = (property: string) =>
  window.getComputedStyle(document.body).getPropertyValue(property);

//
// STORIES
//
export const Playground: Story = {
  args: {
    ...defaultArgs,
  },
  play: ({canvasElement}: {canvasElement: HTMLElement}) => {
    const canvas = within(canvasElement);

    const card = canvas.getByText('IconHighlight Heading').closest('div');
    expect(card).toHaveStyle('display: grid;');

    const cardIcon = card?.firstElementChild;
    expect(cardIcon).toHaveStyle('grid-column-start: 1;');
    expect(cardIcon).toHaveStyle('font-size: 32px;');
    expect(cardIcon).toHaveStyle('font-weight: 900;');
    expect(cardIcon).toHaveStyle(
      `color: ${getComputedStylePropValue('--text-neutral-primary')};`,
    );

    const cardHeading = canvas.getByText('IconHighlight Heading');
    expect(cardHeading).toHaveStyle('grid-column-start: 2;');

    const cardText = canvas.getByText('IconHighlight Multiline Text');
    expect(cardText).toHaveStyle('grid-column-start: 2;');
  },
};

export const WithLinks: Story = {
  args: {
    ...defaultArgs,
    links: [
      {key: 'link-a', text: 'Internal Link A', href: '#', external: false},
      {key: 'link-b', text: 'Internal Link B', href: '#', external: false},
      {key: 'link-c', text: 'Internal Link C', href: '#', external: false},
      {key: 'link-d', text: 'External Link D', href: '#', external: true},
      {key: 'link-e', text: 'External Link E', href: '#', external: true},
      {key: 'link-f', text: 'External Link F', href: '#', external: true},
    ],
  },
  play: ({canvasElement}) => {
    const canvas = within(canvasElement);

    const linkList = canvas.getByRole('list');
    expect(linkList).toHaveStyle('grid-column-start: 2;');
  },
};
