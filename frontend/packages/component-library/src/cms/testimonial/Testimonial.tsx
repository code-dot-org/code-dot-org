import classNames from 'classnames';
import {HTMLAttributes} from 'react';

import FontAwesomeV6Icon from '@/fontAwesomeV6Icon';
import {BodyOneText, BodyThreeText, StrongText} from '@/typography';

import styles from './testimonial.module.scss';

export enum TESTIMONIAL_BACKGROUNDS {
  DARK = 'dark',
  PRIMARY = 'primary',
}

export interface TestimonialProps extends HTMLAttributes<HTMLElement> {
  /** Testimonial quote */
  quote: string;
  /** Source of the quote or the author's name */
  source: string;
  /** Additional context for the quote or the author's position/title */
  context?: string;
  /** Testimonial background */
  background?: TESTIMONIAL_BACKGROUNDS;
  /** Testimonial class name */
  className?: string;
}

/**
 * ## Production-ready Checklist:
 *  * (✔) implementation of component approved by design team;
 *  * (✔) has storybook, covered with stories and documentation;
 *  * (✔) has tests: test every prop, every state and every interaction that's js related;
 *  * (see ./__tests__/Testimonial.test.tsx)
 *  * (✔) passes accessibility checks;
 *
 * ### Status: ```Ready for dev```
 *
 * Design System: Testimonial Component.
 * Highlights a personal testimonial from an individual.
 */
const Testimonial: React.FC<TestimonialProps> = ({
  quote,
  source,
  context,
  background = TESTIMONIAL_BACKGROUNDS.DARK,
  className,
  ...HTMLAttributes
}) => (
  <figure
    {...HTMLAttributes}
    data-theme="Dark"
    className={classNames(
      styles.testimonial,
      styles[`testimonial-background-${background}`],
      className,
    )}
  >
    <blockquote>
      <BodyOneText visualAppearance="heading-md">
        <FontAwesomeV6Icon
          iconName="quote-left"
          className={styles.testimonialQuoteIcon}
          aria-hidden="true"
        />
        {quote}
        <FontAwesomeV6Icon
          iconName="quote-right"
          className={styles.testimonialQuoteIcon}
          aria-hidden="true"
        />
      </BodyOneText>
    </blockquote>

    <figcaption>
      <StrongText visualAppearance="heading-xs">{source}</StrongText>
      {context && <BodyThreeText>{context}</BodyThreeText>}
    </figcaption>
  </figure>
);

export default Testimonial;
