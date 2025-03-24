import DSCOSection, {
  SectionProps,
} from '@code-dot-org/component-library/cms/section';

// Import the background image used in the pattern backgrounds on Contentful
import bgPatternImage from '@public/images/bg-pattern-lines.png';

const Section: React.FC<SectionProps> = ({background, ...props}) => (
  <DSCOSection
    {...props}
    background={background}
    backgroundImageUrl={
      background === 'patternDark' || background === 'patternPrimary'
        ? bgPatternImage.src
        : undefined
    }
  />
);

export default Section;
