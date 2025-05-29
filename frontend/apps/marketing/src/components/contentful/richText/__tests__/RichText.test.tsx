import {
  BLOCKS,
  INLINES,
  MARKS,
  Document,
  TopLevelBlock,
} from '@contentful/rich-text-types';
import {render, screen} from '@testing-library/react';

import RichText, {
  RichTextProps,
} from '@/components/contentful/richText/RichText';

describe('RichText component', () => {
  const buildRichTextDocument = (content: TopLevelBlock[]): Document => ({
    nodeType: BLOCKS.DOCUMENT,
    data: {},
    content: content,
  });

  const renderComponent = ({content}: RichTextProps) =>
    render(<RichText content={content} />);

  it('renders empty content placeholder', () => {
    renderComponent({});

    const placeholder = screen.getByText(
      (_, node) =>
        node?.tagName === 'EM' &&
        !!node?.textContent?.includes('Rich Text placeholder'),
    );

    expect(placeholder).toBeVisible();
  });

  it('renders paragraph with normal text', () => {
    const paragraphText = 'Test Paragraph';

    renderComponent({
      content: buildRichTextDocument([
        {
          nodeType: BLOCKS.PARAGRAPH,
          data: {},
          content: [
            {
              nodeType: 'text',
              value: paragraphText,
              marks: [],
              data: {},
            },
          ],
        },
      ]),
    });

    const paragraph = screen.getByText(paragraphText);
    expect(paragraph).toBeVisible();
    expect(paragraph).toHaveRole('paragraph');
  });

  it('renders paragraph with bold text', () => {
    const paragraphText = 'Test Paragraph';

    renderComponent({
      content: buildRichTextDocument([
        {
          nodeType: BLOCKS.PARAGRAPH,
          data: {},
          content: [
            {
              nodeType: 'text',
              value: paragraphText,
              marks: [{type: MARKS.BOLD}],
              data: {},
            },
          ],
        },
      ]),
    });

    const paragraph = screen.getByText(paragraphText);
    expect(paragraph).toBeVisible();
    expect(paragraph.tagName).toBe('STRONG');
    expect(paragraph.parentElement).toHaveRole('paragraph');
  });

  it('renders paragraph with italic text', () => {
    const paragraphText = 'Test Paragraph';

    renderComponent({
      content: buildRichTextDocument([
        {
          nodeType: BLOCKS.PARAGRAPH,
          data: {},
          content: [
            {
              nodeType: 'text',
              value: paragraphText,
              marks: [{type: MARKS.ITALIC}],
              data: {},
            },
          ],
        },
      ]),
    });

    const paragraph = screen.getByText(paragraphText);
    expect(paragraph).toBeVisible();
    expect(paragraph.tagName).toBe('EM');
    expect(paragraph.parentElement).toHaveRole('paragraph');
  });

  it('renders paragraph with link', () => {
    const linkText = 'Test Link';
    const linkHref = 'https://example.com';

    renderComponent({
      content: buildRichTextDocument([
        {
          nodeType: BLOCKS.PARAGRAPH,
          data: {},
          content: [
            {
              nodeType: INLINES.HYPERLINK,
              data: {uri: linkHref},
              content: [
                {
                  nodeType: 'text',
                  value: linkText,
                  marks: [],
                  data: {},
                },
              ],
            },
          ],
        },
      ]),
    });

    const link = screen.getByText(linkText);
    expect(link).toBeVisible();
    expect(link).toHaveRole('link');
    expect(link).toHaveAttribute('href', linkHref);
    expect(link.parentElement).toHaveRole('paragraph');
  });

  it('renders list', () => {
    const listItemText = 'Test List Item';

    renderComponent({
      content: buildRichTextDocument([
        {
          nodeType: BLOCKS.UL_LIST,
          data: {},
          content: [
            {
              nodeType: 'text',
              value: listItemText,
              marks: [],
              data: {},
            },
          ],
        },
      ]),
    });

    const listItem = screen.getByText(listItemText);
    expect(listItem).toBeVisible();
    expect(listItem.parentElement).toHaveRole('listitem');
  });
});
