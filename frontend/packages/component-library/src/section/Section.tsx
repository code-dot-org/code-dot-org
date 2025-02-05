import classNames from 'classnames';
import {HTMLAttributes, ReactNode} from 'react';

import moduleStyles from './section.module.scss';

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  /** Background color */
  backgroundColor?:
    | 'primary'
    | 'secondary'
    | 'dark'
    | 'brand-light-primary'
    | 'brand-light-secondary';
  /** Background image */
  backgroundImage?: string;
  /** Background image repeat */
  backgroundImageRepeat?: boolean;
  /** Background size */
  backgroundSize?: 'contain' | 'cover';
  /** Vertical padding */
  padding?: 'm' | 'l';
  /** Content alignment */
  alignment?: 'left' | 'center';
  /** Section content */
  children?: ReactNode;
}

/**
 * ## Production-ready Checklist:
 *  * (✘) implementation of component approved by design team;
 *  * (✘) has storybook, covered with stories and documentation;
 *  * (✘) has tests: test every prop, every state and every interaction that's js related;
 *  * (see ./__tests__/Section.test.tsx)
 *  * (✘) passes accessibility checks;
 *
 * ###  Status: ```WIP```
 *
 * Design System: Section Component.
 * Acts as a container for section content in the Contentful CMS.
 */
const Section: React.FC<SectionProps> = ({
  backgroundColor = 'primary',
  backgroundImage,
  backgroundImageRepeat,
  backgroundSize,
  padding = 'l',
  alignment = 'left',
  children,
  className,
  ...HTMLAttributes
}: SectionProps) => {
  return (
    <section
      className={classNames(
        moduleStyles.section,
        moduleStyles[`section-${backgroundColor}`],
        moduleStyles[`section-${padding}`],
        moduleStyles[`section-${alignment}`],
        className,
        backgroundImage ? moduleStyles.overlay : '',
      )}
      style={{
        ...(backgroundImage && {
          backgroundImage: `url(${backgroundImage})`,
          backgroundRepeat: backgroundImageRepeat ? 'repeat' : 'no-repeat',
          backgroundSize: backgroundSize,
          backgroundPosition: 'center',
        }),
      }}
      data-testid="section"
      {...HTMLAttributes}
    >
      <div
        className={classNames(moduleStyles.container)}
        data-testid="container"
      >
        {children}
      </div>
    </section>
  );
};

export default Section;
