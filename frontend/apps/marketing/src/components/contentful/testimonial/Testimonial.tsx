import Testimonial, {
  TESTIMONIAL_BACKGROUNDS,
  TestimonialProps,
} from '@code-dot-org/component-library/cms/testimonial';

// Import the background image used in the pattern backgrounds on Contentful
import bgPatternImage from '@public/images/bg-pattern-lines.png';

export enum TESTIMONIAL_CONTENTFUL_BACKGROUNDS {
  PATTERN_DARK = 'Pattern Dark',
  PATTERN_PRIMARY = 'Pattern Primary',
}

const TESTIMONIAL_BACKGROUNDS_MAP = {
  [TESTIMONIAL_CONTENTFUL_BACKGROUNDS.PATTERN_DARK]:
    TESTIMONIAL_BACKGROUNDS.DARK,
  [TESTIMONIAL_CONTENTFUL_BACKGROUNDS.PATTERN_PRIMARY]:
    TESTIMONIAL_BACKGROUNDS.PRIMARY,
};

interface TestimonialContentfulProps
  extends Omit<TestimonialProps, 'background'> {
  background: TESTIMONIAL_CONTENTFUL_BACKGROUNDS;
}

const TestimonialContentful: React.FC<TestimonialContentfulProps> = ({
  quote,
  source,
  context,
  background,
}) => (
  <Testimonial
    quote={quote}
    source={source}
    context={context}
    background={TESTIMONIAL_BACKGROUNDS_MAP[background]}
    style={{
      backgroundImage: `url(${bgPatternImage.src})`,
      backgroundRepeat: 'repeat',
      backgroundSize: '18rem',
    }}
  />
);

export default TestimonialContentful;
