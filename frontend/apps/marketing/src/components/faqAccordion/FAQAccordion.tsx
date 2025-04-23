import {documentToHtmlString} from '@contentful/rich-text-html-renderer';
import {EntryFields, BaseEntry} from 'contentful';
import {useMemo} from 'react';
import TurndownService from 'turndown';

import FAQAccordion, {
  FAQAccordionItem,
} from '@code-dot-org/component-library/accordrion/faqAccordion';

import RichText from '@/components/richText';

import moduleStyles from './faqAccordion.module.scss';

export type FAQAccordionContentfulProps = {
  faqs?: (BaseEntry & {
    fields: {
      question: EntryFields.Text | EntryFields.RichText;
      answer: EntryFields.Text | EntryFields.RichText;
    };
  })[];
};

const checkIfEntryFieldIsRichText = (
  entry: BaseEntry & {
    fields: {[key: string]: EntryFields.Text | EntryFields.RichText};
  },
  fieldName: string,
) =>
  typeof entry.fields[fieldName] !== 'string' &&
  'content' in entry.fields[fieldName];

const FAQAccordionContentful: React.FunctionComponent<
  FAQAccordionContentfulProps
> = ({faqs}) => {
  const htmlToMarkdownConverter = new TurndownService();

  // Converts decorated inline elements to plain text for JSON-LD
  htmlToMarkdownConverter.addRule('plainText', {
    filter: ['p', 'b', 'strong', 'i', 'em'],
    replacement: (content, node) =>
      node.parentNode && ['P', 'LI'].includes(node.parentNode.nodeName)
        ? content
        : content + '\n\n',
  });

  const faqItems = useMemo(
    () =>
      faqs?.filter(Boolean).map(faq => {
        let question, questionString, answer, answerString;

        if (checkIfEntryFieldIsRichText(faq, 'question')) {
          const richTextQuestion = faq.fields.question as EntryFields.RichText;
          question = <RichText content={richTextQuestion} />;
          questionString = htmlToMarkdownConverter.turndown(
            documentToHtmlString(richTextQuestion),
          );
        } else {
          question = faq.fields.question as string;
          questionString = question;
        }

        if (checkIfEntryFieldIsRichText(faq, 'answer')) {
          const richTextAnswer = faq.fields.answer as EntryFields.RichText;
          answer = (
            <div className={moduleStyles.faqAccordionAnswer}>
              <RichText content={richTextAnswer} />
            </div>
          );
          answerString = htmlToMarkdownConverter.turndown(
            documentToHtmlString(richTextAnswer),
          );
        } else {
          answer = faq.fields.answer as string;
          answerString = answer;
        }

        return {
          id: questionString,
          label: question,
          questionString,
          content: answer,
          answerString,
        } as FAQAccordionItem;
      }) || [],
    [faqs],
  );

  // Show placeholder text until a content entry is added
  if (!faqItems.length) {
    return (
      <div style={{color: 'var(--text-neutral-primary)'}}>
        <em>
          <strong>❓ FAQ Accordion placeholder.</strong> Please add a "FAQs"
          content type entry in the FAQ Accordion sidebar, save, and open the
          preview tab to see the accordions in action.
        </em>
      </div>
    );
  }

  return (
    <FAQAccordion className={moduleStyles.faqAccordion} items={faqItems} />
  );
};

export default FAQAccordionContentful;
