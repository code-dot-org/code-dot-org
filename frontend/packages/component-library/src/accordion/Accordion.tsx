import {HTMLAttributes, ReactNode} from 'react';
import classNames from 'classnames';

import FontAwesomeV6Icon from '@/fontAwesomeV6Icon';
import {BodyTwoText, StrongText} from '@/typography';

import moduleStyles from './accordion.module.scss';

export type AccordionItem = {
  id: string;
  label: string | ReactNode;
  content: string | ReactNode;
};

export interface AccordionProps extends HTMLAttributes<HTMLDivElement> {
  /** List of Accordion items */
  items: AccordionItem[];
  /** Custom className for additional styling */
  className?: string;
}

/**
 * ## Production-ready Checklist:
 *  * (✔) implementation of component approved by design team;
 *  * (✔) has storybook, covered with stories and documentation;
 *  * (✔) has tests: test every prop, every state and every interaction that's js related;
 *  * (see ./__tests__/Accordion.test.tsx)
 *  * (✔) passes accessibility checks;
 *
 * ###  Status: ```Ready for dev```
 *
 * Design System: Accordion Component.
 * Renders an accordion with a list of items.
 */
const Accordion: React.FC<AccordionProps> = ({
  items,
  className,
  ...HTMLAttributes
}) => (
  <div
    className={classNames(moduleStyles.accordion, className)}
    {...HTMLAttributes}
  >
    {items.map(({id, label, content}) => (
      <details key={id}>
        <summary>
          {typeof label === 'string' ? (
            <BodyTwoText>
              <StrongText>{label}</StrongText>
            </BodyTwoText>
          ) : (
            label
          )}
          <FontAwesomeV6Icon iconName="chevron-down" />
        </summary>
        {typeof content === 'string' ? (
          <BodyTwoText>{content}</BodyTwoText>
        ) : (
          content
        )}
      </details>
    ))}
  </div>
);

export default Accordion;
