import {
  BLOCKS,
  INLINES,
  MARKS,
  Document,
  TopLevelBlock,
  Paragraph,
  ListItem,
} from '@contentful/rich-text-types';
import {render, screen} from '@testing-library/react';

import FAQAccordion from '@/components/faqAccordion/FAQAccordion';

describe('FAQAccordion component', () => {
  const buildJsonLdContent = (question: string, answer: string) =>
    JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: answer,
          },
        },
      ],
    });

  const renderComponent = (props: object = {}) =>
    render(<FAQAccordion {...props} />);

  it('renders empty content placeholder', () => {
    renderComponent({});

    const placeholder = screen.getByText(
      (_, node) =>
        node?.tagName === 'EM' &&
        !!node?.textContent?.includes('FAQ Accordion placeholder'),
    );

    expect(placeholder).toBeVisible();
  });

  const queryJsonLdScript = () =>
    document.querySelector('script[type="application/ld+json"]');

  describe('with Rich Text FAQ content', () => {
    const questionText = 'Test Question';
    const answerText = 'Test Answer';

    const buildRichTextDocument = (content: TopLevelBlock[]): Document => ({
      nodeType: BLOCKS.DOCUMENT,
      data: {},
      content: content,
    });

    const buildRichTextParagraph = (
      value: string,
      content = {},
    ): Paragraph => ({
      nodeType: BLOCKS.PARAGRAPH,
      data: {},
      content: [{nodeType: 'text', marks: [], data: {}, ...content, value}],
    });

    const buildRichTextListItem = (value: string): ListItem => ({
      nodeType: BLOCKS.LIST_ITEM,
      data: {},
      content: [buildRichTextParagraph(value)],
    });

    it('renders accordion with provided content', () => {
      renderComponent({
        faqs: [
          {
            fields: {
              question: buildRichTextDocument([
                buildRichTextParagraph(questionText),
              ]),
              answer: buildRichTextDocument([
                buildRichTextParagraph(answerText),
              ]),
            },
          },
        ],
      });

      expect(screen.getByText(questionText)).toBeVisible();
      expect(screen.getByText(answerText)).toBeInTheDocument();
      expect(queryJsonLdScript()).toHaveTextContent(
        buildJsonLdContent(questionText, answerText),
      );
    });

    it('renders with bold text as plain text in JSON-LD script', () => {
      renderComponent({
        faqs: [
          {
            fields: {
              question: buildRichTextDocument([
                buildRichTextParagraph(questionText, {
                  marks: [{type: MARKS.BOLD}],
                }),
              ]),
              answer: buildRichTextDocument([
                buildRichTextParagraph(answerText, {
                  marks: [{type: MARKS.BOLD}],
                }),
              ]),
            },
          },
        ],
      });

      expect(queryJsonLdScript()).toHaveTextContent(
        buildJsonLdContent(questionText, answerText),
      );
    });

    it('renders with italic text as plain text in JSON-LD script', () => {
      renderComponent({
        faqs: [
          {
            fields: {
              question: buildRichTextDocument([
                buildRichTextParagraph(questionText, {
                  marks: [{type: MARKS.ITALIC}],
                }),
              ]),
              answer: buildRichTextDocument([
                buildRichTextParagraph(answerText, {
                  marks: [{type: MARKS.ITALIC}],
                }),
              ]),
            },
          },
        ],
      });

      expect(queryJsonLdScript()).toHaveTextContent(
        buildJsonLdContent(questionText, answerText),
      );
    });

    it('renders link in markdown format for JSON-LD script', () => {
      const questionLinkHref = 'https://question.example';
      const answerLinkHref = 'https://answer.example';

      renderComponent({
        faqs: [
          {
            fields: {
              question: buildRichTextDocument([
                buildRichTextParagraph(questionText, {
                  nodeType: INLINES.HYPERLINK,
                  data: {uri: questionLinkHref},
                  content: [
                    {
                      nodeType: 'text',
                      value: questionText,
                      marks: [],
                      data: {},
                    },
                  ],
                }),
              ]),
              answer: buildRichTextDocument([
                buildRichTextParagraph(answerText, {
                  nodeType: INLINES.HYPERLINK,
                  data: {uri: answerLinkHref},
                  content: [
                    {
                      nodeType: 'text',
                      value: answerText,
                      marks: [],
                      data: {},
                    },
                  ],
                }),
              ]),
            },
          },
        ],
      });

      expect(queryJsonLdScript()).toHaveTextContent(
        buildJsonLdContent(
          `[${questionText}](${questionLinkHref})`,
          `[${answerText}](${answerLinkHref})`,
        ),
      );
    });

    it('renders lists in markdown format for JSON-LD script', () => {
      const questionListItemA = questionText + ' A';
      const questionListItemB = questionText + ' B';
      const answerListItem1 = answerText + ' 1';
      const answerListItem2 = answerText + ' 2';

      renderComponent({
        faqs: [
          {
            fields: {
              question: buildRichTextDocument([
                {
                  nodeType: BLOCKS.UL_LIST,
                  data: {},
                  content: [
                    buildRichTextListItem(questionListItemA),
                    buildRichTextListItem(questionListItemB),
                  ],
                },
              ]),
              answer: buildRichTextDocument([
                {
                  nodeType: BLOCKS.OL_LIST,
                  data: {},
                  content: [
                    buildRichTextListItem(answerListItem1),
                    buildRichTextListItem(answerListItem2),
                  ],
                },
              ]),
            },
          },
        ],
      });

      expect(queryJsonLdScript()).toHaveTextContent(
        buildJsonLdContent(
          `* ${questionListItemA}\n* ${questionListItemB}`,
          `1. ${answerListItem1}\n2. ${answerListItem2}`,
        ),
      );
    });
  });
});
