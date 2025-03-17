import classNames from 'classnames';
import {HTMLAttributes, ReactNode} from 'react';

import {SpacingNoneToS, SpacingNoneToL} from '@/common/types';

import moduleStyles from './section.module.scss';

export type SectionBackground =
  | 'primary'
  | 'secondary'
  | 'dark'
  | 'brandLightPrimary'
  | 'brandLightSecondary'
  | 'patternDark'
  | 'patternPrimary';

export const sectionBackground: {
  [key in SectionBackground]: SectionBackground;
} = {
  primary: 'primary',
  secondary: 'secondary',
  dark: 'dark',
  brandLightPrimary: 'brandLightPrimary',
  brandLightSecondary: 'brandLightSecondary',
  patternDark: 'patternDark',
  patternPrimary: 'patternPrimary',
};

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  /** Background color */
  background?: SectionBackground;
  /** Background image */
  backgroundImageUrl?: string;
  /** Vertical padding */
  padding?: Exclude<SpacingNoneToL, SpacingNoneToS>;
  /** Section theme */
  theme?: 'Light' | 'Dark';
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
 * Supports Light and Dark themes automatically based on background color.
 */
const Section: React.FC<SectionProps> = ({
  background = 'primary',
  backgroundImageUrl,
  padding = 'l',
  theme = 'Light',
  children,
  className,
  ...HTMLAttributes
}: SectionProps) => {
  const hasPatternBackground =
    background === sectionBackground.patternDark ||
    background === sectionBackground.patternPrimary;

  const useDarkTheme =
    hasPatternBackground || background === sectionBackground.dark;

  return (
    <section
      data-theme={hasPatternBackground || useDarkTheme ? 'Dark' : theme}
      className={classNames(
        moduleStyles.section,
        moduleStyles[`section-background-${background}`],
        moduleStyles[`section-padding-${padding}`],
        className,
      )}
      {...HTMLAttributes}
      style={{
        ...(hasPatternBackground
          ? backgroundImageUrl
            ? {
                backgroundImage: `url(${backgroundImageUrl})`,
                backgroundRepeat: 'repeat',
                backgroundSize: '18rem',
              }
            : {}
          : {}),
      }}
    >
      <div className={classNames(moduleStyles.container)}>{children}</div>
    </section>
  );
};

export default Section;
