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
import {escape} from 'lodash';

import FAQAccordion from '@/components/contentful/faqAccordion/FAQAccordion';

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
        buildJsonLdContent(questionText, escape(`<p>${answerText}</p>`)),
      );
    });

    it('renders with bold text in valid JSON-LD script format', () => {
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
        buildJsonLdContent(questionText, escape(`<p><b>${answerText}</b></p>`)),
      );
    });

    it('renders with italic text in valid JSON-LD script format', () => {
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
        buildJsonLdContent(questionText, escape(`<p><i>${answerText}</i></p>`)),
      );
    });

    it('renders link in valid JSON-LD script format', () => {
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
          `${questionText}`,
          escape(`<p><a href="${answerLinkHref}">${answerText}</a></p>`),
        ),
      );
    });

    it('renders unordered list in valid JSON-LD script format', () => {
      const questionListItemA = questionText + ' A';
      const questionListItemB = questionText + ' B';
      const answerListItemA = answerText + ' A';
      const answerListItemB = answerText + ' B';

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
                  nodeType: BLOCKS.UL_LIST,
                  data: {},
                  content: [
                    buildRichTextListItem(answerListItemA),
                    buildRichTextListItem(answerListItemB),
                  ],
                },
              ]),
            },
          },
        ],
      });

      expect(queryJsonLdScript()).toHaveTextContent(
        buildJsonLdContent(
          `${questionListItemA} ${questionListItemB}`,
          escape(
            `<ul><li><p>${answerListItemA}</p></li><li><p>${answerListItemB}</p></li></ul>`,
          ),
        ),
      );
    });

    it('renders ordered list in valid JSON-LD script format', () => {
      const questionListItem1 = questionText + ' 1';
      const questionListItem2 = questionText + ' 2';
      const answerListItem1 = answerText + ' 1';
      const answerListItem2 = answerText + ' 2';

      renderComponent({
        faqs: [
          {
            fields: {
              question: buildRichTextDocument([
                {
                  nodeType: BLOCKS.OL_LIST,
                  data: {},
                  content: [
                    buildRichTextListItem(questionListItem1),
                    buildRichTextListItem(questionListItem2),
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
          `${questionListItem1} ${questionListItem2}`,
          escape(
            `<ol><li><p>${answerListItem1}</p></li><li><p>${answerListItem2}</p></li></ol>`,
          ),
        ),
      );
    });
  });
});
