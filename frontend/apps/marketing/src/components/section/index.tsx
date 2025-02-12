import '@code-dot-org/component-library/cms/section/index.css';

// Import the background image used in the pattern backgrounds on Contentful
import bgPatternImage from '@public/images/bg-pattern-lines.png';

// Export the Component Definition for use in Contentful Studio
export {SectionContentfulComponentDefinition} from './sectionContentfulDefinition';
import DSCOSection, {
  SectionProps,
} from '@code-dot-org/component-library/cms/section';

const Section = (props: SectionProps) => {
  const {background} = props;

  const getBgImage = () => {
    switch (background) {
      case 'patternDark':
      case 'patternPrimary':
        return bgPatternImage.src;
      default:
        return undefined;
    }
  };

  return <DSCOSection {...props} backgroundImageUrl={getBgImage()} />;
};

export default Section;
