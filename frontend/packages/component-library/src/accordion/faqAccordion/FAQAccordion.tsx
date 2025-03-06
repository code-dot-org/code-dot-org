import {default as DOMPurify} from 'dompurify';
import {ReactNode} from 'react';

import Accordion, {AccordionProps} from './../Accordion';

export type FAQItem = {
  id: string;
  label: string | ReactNode;
  questionString: string;
  content: string | ReactNode;
  answerString: string;
};

export interface FAQAccordionProps extends AccordionProps {
  /** List of FAQ items */
  items: FAQItem[];
  /** Custom className for additional styling */
  className?: string;
}

/**
 * ## Production-ready Checklist:
 *  * (✔) implementation of component approved by design team;
 *  * (✔) has storybook, covered with stories and documentation;
 *  * (✔) has tests: test every prop, every state and every interaction that's js related;
 *  * (see ./__tests__/FAQAccordion.test.tsx)
 *  * (✔) passes accessibility checks;
 *
 * ###  Status: ```Ready for dev```
 *
 * Design System: FAQ Accordion Component.
 * Renders an Accordion with a list of items and JSON_LD script that's needed for Google SEO.
 * (see https://developers.google.com/search/docs/appearance/structured-data/faqpage#json-ld)
 */
const FAQAccordion: React.FC<FAQAccordionProps> = ({
  items,
  className,
  ...HTMLAttributes
}) => {
  return (
    <>
      <Accordion items={items} className={className} {...HTMLAttributes} />

      {/* JSON-LD for structured data. Needed for Google SEO.
      (see https://developers.google.com/search/docs/appearance/structured-data/faqpage#json-ld) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: items.map(item => ({
              '@type': 'Question',
              name: DOMPurify.sanitize(item.questionString),
              acceptedAnswer: {
                '@type': 'Answer',
                text: DOMPurify.sanitize(item.answerString),
              },
            })),
          }),
        }}
      />
    </>
  );
};

export default FAQAccordion;
