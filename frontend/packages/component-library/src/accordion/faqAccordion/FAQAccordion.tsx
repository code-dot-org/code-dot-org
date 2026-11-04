import {ReactNode} from 'react';
import {JsonLd} from 'react-schemaorg';
import type {FAQPage} from 'schema-dts';

import Accordion, {AccordionProps} from './../Accordion';

/**
 * @deprecated Use `MuiFAQAccordionItem` from `@code-dot-org/component-library/accordion/faqAccordion`.
 * Codemod: `codemods/accordion-to-mui.ts` in `frontend/packages/component-library`.
 */
export type FAQAccordionItem = {
  id: string;
  label: string | ReactNode;
  questionString: string;
  content: string | ReactNode;
  answerString: string;
};

/**
 * @deprecated Use `MuiFAQAccordionProps` from `@code-dot-org/component-library/accordion`.
 * Codemod: `codemods/accordion-to-mui.ts` in `frontend/packages/component-library`.
 */
export interface FAQAccordionProps extends AccordionProps {
  /** List of FAQ items */
  items: FAQAccordionItem[];
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
 *
 * @deprecated Use `MuiFAQAccordion` from `@code-dot-org/component-library/accordion`; it takes the same props.
 * Codemod: `codemods/accordion-to-mui.ts` in `frontend/packages/component-library`.
 * See `src/accordion/ACCORDION_MIGRATION_TO_MUI.md`.
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
      <JsonLd<FAQPage>
        item={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: items.map(item => ({
            '@type': 'Question',
            name: item.questionString,
            acceptedAnswer: {
              '@type': 'Answer',
              text: item.answerString,
            },
          })),
        }}
      />
    </>
  );
};

export default FAQAccordion;
