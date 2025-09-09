import {documentToHtmlString} from '@contentful/rich-text-html-renderer';
import {documentToPlainTextString} from '@contentful/rich-text-plain-text-renderer';
import {BLOCKS} from '@contentful/rich-text-types';
import {ExpandMore} from '@mui/icons-material';
import MuiAccordion from '@mui/material/Accordion';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import MuiAccordionSummary from '@mui/material/AccordionSummary';
import MuiBox from '@mui/material/Box';
import {EntryFields, BaseEntry} from 'contentful';
import {useMemo} from 'react';
import {JsonLd} from 'react-schemaorg';
import type {FAQPage} from 'schema-dts';

import RichText from '@/components/contentful/richText';

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

const slugify = (str: string) =>
  encodeURIComponent(str.trim().toLowerCase().replace(/\s+/g, '-'));

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
          answer = <RichText content={faq.fields.answer} />;
          // See: https://developers.google.com/search/docs/appearance/structured-data/faqpage#answer
          answerString = documentToHtmlString(faq.fields.answer, {
            preserveWhitespace: true,
          });
        } else {
          answer = faq.fields.answer;
          answerString = answer;
        }

        const safeId = slugify(questionString);

        return {
          id: safeId,
          label: question,
          questionString,
          content: answer,
          answerString,
        };
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
    <MuiBox>
      {faqItems.map(item => {
        const summaryId = `accordion-summary-${item.id}`;
        const detailsId = `accordion-details-${item.id}`;

        return (
          <MuiAccordion key={item.id} slotProps={{heading: {component: 'div'}}}>
            <MuiAccordionSummary
              id={summaryId}
              aria-controls={detailsId}
              component="summary"
              expandIcon={<ExpandMore />}
            >
              {item.label}
            </MuiAccordionSummary>
            <MuiAccordionDetails id={detailsId} aria-labelledby={summaryId}>
              {item.content}
            </MuiAccordionDetails>
          </MuiAccordion>
        );
      })}

      {/* JSON-LD for structured data. Needed for Google SEO.
      (see https://developers.google.com/search/docs/appearance/structured-data/faqpage#json-ld) */}
      <JsonLd<FAQPage>
        item={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqItems.map(item => ({
            '@type': 'Question',
            name: item.questionString,
            acceptedAnswer: {
              '@type': 'Answer',
              text: item.answerString,
            },
          })),
        }}
      />
    </MuiBox>
  );
};

export default FAQAccordionContentful;
