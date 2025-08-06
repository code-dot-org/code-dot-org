/* eslint-disable @typescript-eslint/no-explicit-any */
import RichText from '@/components/contentful/richText';
import {BLOCKS} from '@contentful/rich-text-types';
import type {Meta, StoryObj} from '@storybook/nextjs-vite';
import {expect} from 'storybook/test';

import RichTextMock from './__mocks__/RichText.json';

const meta: Meta<typeof RichText> = {
  title: 'Marketing/RichText',
  component: RichText,
  tags: ['autodocs', 'marketing'],
};
export default meta;
type Story = StoryObj<typeof RichText>;

export const Playground: Story = {
  args: {
    content: {
      nodeType: BLOCKS.DOCUMENT,
      data: {},
      content: [
        {
          nodeType: BLOCKS.PARAGRAPH,
          data: {},
          content: [
            {
              nodeType: 'text',
              value: 'Playground Rich Text',
              marks: [],
              data: {},
            },
          ],
        },
      ],
    },
  },
  argTypes: {
    content: {control: 'object'},
  },
};

export const FilledOut: Story = {
  args: RichTextMock as any,
  play: async ({canvas}) => {
    // Accessibility: paragraphs
    const paragraphs = canvas.getAllByRole('paragraph', {hidden: true});
    expect(paragraphs.length).toBeGreaterThan(0);
    paragraphs.forEach(p => expect(p).toBeVisible());

    // Accessibility: links
    const links = canvas.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
    links.forEach(link => {
      expect(link).toHaveAttribute('href');
      expect(link).toBeVisible();
      expect(link).toHaveAccessibleName();
    });

    // Accessibility: lists (ul and ol)
    const lists = canvas.getAllByRole('list');
    expect(lists.length).toBeGreaterThan(0);
    lists.forEach(list => {
      expect(list).toBeVisible();
      const items = canvas.getAllByRole('listitem');
      expect(items.length).toBeGreaterThan(0);
      items.forEach(item => expect(item).toBeVisible());
    });

    // Accessibility: table
    const table = canvas.getByRole('table');
    expect(table).toBeVisible();
    const rows = canvas.getAllByRole('row');
    expect(rows.length).toBeGreaterThan(0);
    rows.forEach(row => expect(row).toBeVisible());
    const cells = canvas.getAllByRole('cell');
    expect(cells.length).toBeGreaterThan(0);
    cells.forEach(cell => expect(cell).toBeVisible());
    const headers = canvas.getAllByRole('columnheader');
    expect(headers.length).toBeGreaterThan(0);
    headers.forEach(header => expect(header).toBeVisible());
  },
};
