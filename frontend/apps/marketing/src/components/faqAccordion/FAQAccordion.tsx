import {EntryFields, BaseEntry} from 'contentful';
import {useMemo} from 'react';

import FAQAccordion, {
  FAQAccordionItem,
} from '@code-dot-org/component-library/accordrion/faqAccordion';

type FAQAccordionContentfulProps = {
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
  const faqItems = useMemo(
    () =>
      faqs?.filter(Boolean).map(faq => {
        let id, question, questionString, answer, answerString;

        if (checkIfEntryFieldIsRichText(faq, 'question')) {
          question =
            'Rich Text is not supported yet. Please use Text type instead';
          questionString = question;
          id = 'rich-text-not-supported-yet';
        } else {
          question = faq.fields.question as string;
          questionString = question;
          id = question.replace(' ', '-').toLowerCase();
        }

        if (checkIfEntryFieldIsRichText(faq, 'answer')) {
          answer =
            'Rich Text is not supported yet. Please use Text type instead';
          answerString = answer;
        } else {
          answer = faq.fields.answer as string;
          answerString = answer;
        }

        return {
          id,
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
          <strong>✍ FAQ Accordion placeholder.</strong> Please add a "FAQs"
          content type entry in the FAQ Accordion sidebar, save, and open the
          preview tab to see the accordions in action.
        </em>
      </div>
    );
  }

  return <FAQAccordion items={faqItems} />;
};

export default FAQAccordionContentful;
