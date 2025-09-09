import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import classNames from 'classnames';
import {ReactNode} from 'react';

import type {SpacingProps} from '@/components/common/types';
import {DividerProps} from '@/components/contentful/divider';
import bgPatternImage from '@public/images/bg-pattern-lines.webp';

export type SectionBackground =
  | 'primary'
  | 'secondary'
  | 'dark'
  | 'brandPrimary'
  | 'brandLightPrimary'
  | 'brandSecondary'
  | 'brandLightSecondary'
  | 'brandTertiary'
  | 'brandLightTertiary'
  | 'patternDark'
  | 'patternPrimary'
  | 'transparent';

export const sectionBackground: {
  [key in SectionBackground]: SectionBackground;
} = {
  primary: 'primary',
  secondary: 'secondary',
  dark: 'dark',
  brandPrimary: 'brandPrimary',
  brandLightPrimary: 'brandLightPrimary',
  brandSecondary: 'brandSecondary',
  brandLightSecondary: 'brandLightSecondary',
  brandTertiary: 'brandTertiary',
  brandLightTertiary: 'brandLightTertiary',
  patternDark: 'patternDark',
  patternPrimary: 'patternPrimary',
  transparent: 'transparent',
};

export type SectionDivider = Exclude<'none' | DividerProps['color'], 'white'>;

export const sectionDivider: {
  [key in Exclude<SectionDivider, undefined>]: SectionDivider;
} = {
  none: 'none',
  primary: 'primary',
  strong: 'strong',
};

export interface SectionProps {
  /** Background color */
  background?: SectionBackground;
  /** Vertical padding */
  padding?: keyof Exclude<SpacingProps, 'xs' | 's'>;
  /** Section theme */
  theme?: 'Light' | 'Dark';
  /** Has bottom divider */
  divider?: SectionDivider;
  /** Section ID */
  id?: string;
  /** Section className */
  className?: string;
  /** Section content */
  children?: ReactNode;
}

const styles = {
  section: {
    display: 'block',
    boxSizing: 'border-box',
    paddingInline: '1.5rem',
    width: '100%',
  },
};

const Section: React.FC<SectionProps> = ({
  background = 'primary',
  padding = 'l',
  theme = 'Light',
  divider = sectionDivider.none,
  id,
  className,
  children,
}: SectionProps) => {
  // This is used for the Corporate Site only to determine
  // if the section has a hardcoded pattern.
  const hasPatternBackground =
    background === sectionBackground.patternDark ||
    background === sectionBackground.patternPrimary;

  // This is used for the Corporate Site only to determine
  // if the section should use a dark theme.
  const useDarkTheme =
    hasPatternBackground || background === sectionBackground.dark;

  return (
    <Box
      id={id}
      component="section"
      // Dark theme is used on the Corporate Site only
      data-theme={hasPatternBackground || useDarkTheme ? 'Dark' : theme}
      className={classNames(`section-background-${background}`, className)}
      sx={{
        ...styles.section,
        // Fallback dark bg color for older browsers that don't support CSS :has()
        ...(useDarkTheme && {
          backgroundColor: '#212121',
        }),
        // This hardcoded bg pattern is used on the Corporate Site only
        ...(background === 'patternDark' || background === 'patternPrimary'
          ? {
              backgroundImage: `url(${bgPatternImage.src})`,
              backgroundRepeat: 'repeat',
              backgroundSize: '18rem',
            }
          : {}),
      }}
    >
      <Container
        className={classNames(
          'container',
          `container--spacing-${padding}`,
          divider !== 'none' && `container--divider-${divider}`,
        )}
      >
        {children}
      </Container>
    </Box>
  );
};

export default Section;
