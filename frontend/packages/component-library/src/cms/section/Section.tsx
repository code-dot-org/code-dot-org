import classNames from 'classnames';
import {HTMLAttributes, ReactNode} from 'react';

import {ComponentSizeXSToL} from '@/common/types';
import moduleStyles from './section.module.scss';

export type SectionBackgroundColor =
  | 'primary'
  | 'secondary'
  | 'dark'
  | 'brandLightPrimary'
  | 'brandLightSecondary';

export const sectionBackgroundColors: {
  [key in SectionBackgroundColor]: SectionBackgroundColor;
} = {
  primary: 'primary',
  secondary: 'secondary',
  dark: 'dark',
  brandLightPrimary: 'brandLightPrimary',
  brandLightSecondary: 'brandLightSecondary',
};

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  /** Background color */
  backgroundColor?: SectionBackgroundColor;
  /** Vertical padding */
  padding?: Exclude<ComponentSizeXSToL, 'xs' | 's'>;
  /** Section content */
  children?: ReactNode;
}

/**
 * ## Production-ready Checklist:
 *  * (✔) implementation of component approved by design team;
 *  * (✔) has storybook, covered with stories and documentation;
 *  * (✔) has tests: test every prop, every state and every interaction that's js related;
 *  * (see ./__tests__/Section.test.tsx)
 *  * (✔) passes accessibility checks;
 *
 * ### Status: ```Ready for dev```
 *
 * Design System: Section Component.
 * Acts as a container for section content in the Contentful CMS.
 */
const Section: React.FC<SectionProps> = ({
  backgroundColor = 'primary',
  padding = 'l',
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
        className,
      )}
      {...HTMLAttributes}
    >
      <div className={classNames(moduleStyles.container)}>{children}</div>
    </section>
  );
};

export default Section;
