import {
  Accordion,
  AccordionDetails,
  AccordionProps,
  AccordionSummary,
  Typography,
} from '@mui/material';
import classNames from 'classnames';
import {HTMLAttributes, ReactNode} from 'react';

import FontAwesomeV6Icon from '@/fontAwesomeV6Icon';

import moduleStyles from './muiAccordion.module.scss';

export type MuiAccordionItem = {
  /** React key for the item. It never reaches the DOM, so it may repeat across accordions on one page. */
  id: string;
  /** Summary text. A string renders as body2 strong text; a node renders as is inside the summary
   *  `<button>`, so it must be phrasing content (no `<p>`, `<div>` or headings). */
  label: string | ReactNode;
  /** Panel content, mounted and hidden while the item is closed. A string renders as a body2 `<p>`
   *  with 1.25rem padding; a node renders as is, and only its direct `<p>` children get that padding. */
  content: string | ReactNode;
};

export interface MuiAccordionProps extends HTMLAttributes<HTMLDivElement> {
  /** Items in order. All start closed; each opens and closes on its own, on click, Enter or Space. */
  items: MuiAccordionItem[];
  /** Class for the root `<div>`, applied after the module class. The root carries no MUI styles,
   *  so a consumer class meets only the 1rem column layout. */
  className?: string;
}

const LEGACY_SLOT_PROPS: AccordionProps['slotProps'] = {
  // No <h3>: see "Deferred changes" in ACCORDION_MIGRATION_TO_MUI.md.
  heading: {component: 'div'},
  // No role="region": see "Deferred changes" in ACCORDION_MIGRATION_TO_MUI.md.
  region: {role: undefined},
  // No height animation: see "Deferred changes" in ACCORDION_MIGRATION_TO_MUI.md.
  transition: {timeout: 0},
};

/**
 * ###  Status: ```Ready for dev```
 *
 * Design System: Accordion on MUI `Accordion`, one disclosure per item. Takes
 * the legacy `Accordion` props unchanged. The look comes from the `MuiAccordion`,
 * `MuiAccordionSummary` and `MuiAccordionDetails` theme entries.
 */
const MuiAccordion: React.FC<MuiAccordionProps> = ({
  items,
  className,
  ...HTMLAttributes
}) => (
  <div
    className={classNames(moduleStyles.accordion, className)}
    {...HTMLAttributes}
  >
    {items.map(({id, label, content}) => (
      <Accordion key={id} slotProps={LEGACY_SLOT_PROPS}>
        <AccordionSummary
          expandIcon={
            <FontAwesomeV6Icon iconName="chevron-down" aria-hidden="true" />
          }
        >
          {typeof label === 'string' ? (
            <Typography variant="body2" component="span">
              <Typography variant="strong">{label}</Typography>
            </Typography>
          ) : (
            label
          )}
        </AccordionSummary>
        <AccordionDetails>
          {typeof content === 'string' ? (
            <Typography variant="body2">{content}</Typography>
          ) : (
            content
          )}
        </AccordionDetails>
      </Accordion>
    ))}
  </div>
);

export default MuiAccordion;
