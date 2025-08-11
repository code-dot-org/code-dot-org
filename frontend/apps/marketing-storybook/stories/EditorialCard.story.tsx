/* eslint-disable @typescript-eslint/no-explicit-any */

import EditorialCardContentful, {
  EditorialCardContentfulProps,
  EDITORIAL_CARD_CONTENTFUL_LAYOUTS,
} from '@/components/contentful/editorialCard/EditorialCard';
import {Meta, StoryObj} from '@storybook/react';
import {within} from '@testing-library/dom';
import {expect} from 'storybook/test';

import EditorialCardMock from './__mocks__/EditorialCard.json';

const meta: Meta<EditorialCardContentfulProps> = {
  title: 'Marketing/EditorialCard',
  component: EditorialCardContentful,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<EditorialCardContentfulProps>;

function mockEditorialCard(
  layout: EDITORIAL_CARD_CONTENTFUL_LAYOUTS,
  index: number,
) {
  const contentfulDefinition = {
    ...EditorialCardMock,
    heading: `Editorial Card ${index + 1}`,
    layoutOpt: layout,
  } as any;
  return <EditorialCardContentful {...contentfulDefinition} />;
}

function mockEditorialCardWithIcon(
  layout: EDITORIAL_CARD_CONTENTFUL_LAYOUTS,
  index: number,
) {
  const contentfulDefinition = {
    ...EditorialCardMock,
    layoutOpt: layout,
    iconName: `circle-${index + 1}`,
    children: null,
  } as any;
  return <EditorialCardContentful {...contentfulDefinition} />;
}

export const HorizontalWithImage: Story = {
  render: () => (
    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
      {Array.from({length: 4}).map((_, idx) => (
        <div key={idx}>
          {mockEditorialCard(
            EDITORIAL_CARD_CONTENTFUL_LAYOUTS.HORIZONTAL_WITH_IMAGE,
            idx,
          )}
        </div>
      ))}
    </div>
  ),
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const headings = canvas.getAllByRole('heading');
    expect(headings.length).toBe(4);
    headings.forEach((h: HTMLElement) =>
      expect(h.textContent).toMatch(/Editorial Card/),
    );
    const links = canvas.getAllByRole('link', {name: 'Editorial Card Link'});
    expect(links.length).toBe(4);
    links.forEach((link: HTMLElement) => {
      expect(link).toHaveAttribute('href', '/editorial-card-test');
      expect(link.textContent).toBe('Editorial Card Link');
    });
  },
};

export const VerticalWithImage: Story = {
  render: () => (
    <div
      style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px'}}
    >
      {Array.from({length: 3}).map((_, idx) => (
        <div key={idx}>
          {mockEditorialCard(
            EDITORIAL_CARD_CONTENTFUL_LAYOUTS.VERTICAL_WITH_IMAGE,
            idx,
          )}
        </div>
      ))}
    </div>
  ),
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const headings = canvas.getAllByRole('heading');
    expect(headings.length).toBe(3);
    headings.forEach((h: HTMLElement) =>
      expect(h.textContent).toMatch(/Editorial Card/),
    );
    const links = canvas.getAllByRole('link', {name: 'Editorial Card Link'});
    expect(links.length).toBe(3);
    links.forEach((link: HTMLElement) => {
      expect(link).toHaveAttribute('href', '/editorial-card-test');
      expect(link.textContent).toBe('Editorial Card Link');
    });
  },
};

export const VerticalWithIcon: Story = {
  render: () => (
    <div
      style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px'}}
    >
      {Array.from({length: 3}).map((_, idx) => (
        <div key={idx}>
          {mockEditorialCardWithIcon(
            EDITORIAL_CARD_CONTENTFUL_LAYOUTS.VERTICAL_WITH_ICON,
            idx,
          )}
        </div>
      ))}
    </div>
  ),
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const headings = canvas.getAllByRole('heading');
    expect(headings.length).toBe(3);
    headings.forEach((h: HTMLElement) =>
      expect(h.textContent).toMatch(/Editorial Card/),
    );
    const links = canvas.getAllByRole('link', {name: 'Editorial Card Link'});
    expect(links.length).toBe(3);
    links.forEach((link: HTMLElement) => {
      expect(link).toHaveAttribute('href', '/editorial-card-test');
      expect(link.textContent).toBe('Editorial Card Link');
    });
    // Icon test: check for svg or i tag
    const icons = canvasElement.querySelectorAll('svg, i');
    expect(icons.length).toBeGreaterThanOrEqual(3);
  },
};
