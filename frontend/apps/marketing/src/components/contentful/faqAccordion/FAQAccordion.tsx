import {documentToHtmlString} from '@contentful/rich-text-html-renderer';
import {documentToPlainTextString} from '@contentful/rich-text-plain-text-renderer';
import {BLOCKS} from '@contentful/rich-text-types';
import {EntryFields, BaseEntry} from 'contentful';
import {useMemo} from 'react';

import FAQAccordion, {
  FAQAccordionItem,
} from '@code-dot-org/component-library/accordrion/faqAccordion';

import RichText from '@/components/contentful/richText';

import moduleStyles from './faqAccordion.module.scss';

export type FAQAccordionContentfulProps = {
  faqs?: (BaseEntry & {
    fields: {
      question: EntryFields.Text | EntryFields.RichText;
      answer: EntryFields.Text | EntryFields.RichText;
    };
  })[];
};

const isRichText = (
  field: EntryFields.Text | EntryFields.RichText,
): field is EntryFields.RichText =>
  typeof field === 'object' && field?.nodeType === BLOCKS.DOCUMENT;

const FAQAccordionContentful: React.FunctionComponent<
  FAQAccordionContentfulProps
> = ({faqs}) => {
  const faqItems = useMemo(
    () =>
      faqs?.filter(Boolean).map(faq => {
        let question, questionString, answer, answerString;

        if (isRichText(faq.fields.question)) {
          question = <RichText content={faq.fields.question} />;
          // See: https://developers.google.com/search/docs/appearance/structured-data/faqpage#question
          questionString = documentToPlainTextString(faq.fields.question);
        } else {
          question = faq.fields.question;
          questionString = question;
        }

        if (isRichText(faq.fields.answer)) {
          answer = (
            <div className={moduleStyles.faqAccordionAnswer}>
              <RichText content={faq.fields.answer} />
            </div>
          );
          // See: https://developers.google.com/search/docs/appearance/structured-data/faqpage#answer
          answerString = documentToHtmlString(faq.fields.answer, {
            preserveWhitespace: true,
          });
        } else {
          answer = faq.fields.answer;
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
