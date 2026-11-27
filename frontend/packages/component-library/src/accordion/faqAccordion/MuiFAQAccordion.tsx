import {ReactNode} from 'react';
import {JsonLd} from 'react-schemaorg';
import type {FAQPage} from 'schema-dts';

import MuiAccordion, {MuiAccordionProps} from './../MuiAccordion';

export type MuiFAQAccordionItem = {
  /** React key for the item. It never reaches the DOM. */
  id: string;
  /** Summary text, rendered as `MuiAccordion` renders a label. */
  label: string | ReactNode;
  /** Plain-text question for the JSON-LD `Question.name`; not rendered. */
  questionString: string;
  /** Panel content, rendered as `MuiAccordion` renders content. */
  content: string | ReactNode;
  /** Answer text for the JSON-LD `Answer.text`; not rendered. HTML markup is escaped into entities. */
  answerString: string;
};

export interface MuiFAQAccordionProps extends MuiAccordionProps {
  /** FAQ items in order: each renders as a `MuiAccordion` item and one JSON-LD `Question`. */
  items: MuiFAQAccordionItem[];
  /** Class for the accordion's root `<div>`; the JSON-LD script is that root's next sibling. */
  className?: string;
}

/**
 * ###  Status: ```Ready for dev```
 *
 * Design System: FAQ Accordion on `MuiAccordion`, plus the FAQPage JSON-LD
 * script Google reads for FAQ rich results
 * (see https://developers.google.com/search/docs/appearance/structured-data/faqpage#json-ld).
 */
const MuiFAQAccordion: React.FC<MuiFAQAccordionProps> = ({
  items,
  className,
  ...HTMLAttributes
}) => (
  <>
    <MuiAccordion items={items} className={className} {...HTMLAttributes} />
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

export default MuiFAQAccordion;
