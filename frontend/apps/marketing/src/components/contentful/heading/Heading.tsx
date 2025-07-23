import Typography from '@mui/material/Typography';
import {ReactNode} from 'react';

import {RemoveMarginBottomProps} from '@/components/common/types';

type HeadingSemanticTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

// Existing Contentful Heading visualAppearance values that
// were set before using the MUI Typography component.
type HeadingVisualAppearance =
  | 'heading-xxl'
  | 'heading-xl'
  | 'heading-lg'
  | 'heading-md'
  | 'heading-sm'
  | 'heading-xs';

export type HeadingProps = RemoveMarginBottomProps & {
  /** Heading content */
  children: ReactNode;
  /** Heading visual appearance */
  visualAppearance: HeadingVisualAppearance;
  /** Heading color */
  color?: 'primary' | 'white';
  /** ClassName passed by Contentful to apply styles
   * that are set through Contentful native editor */
  className?: string;
};

// Maps Contentful Heading visualAppearance values with
// MUI Typography `component` and `variant` prop values.
const visualAppearanceToSemanticTagMap: Record<
  HeadingVisualAppearance,
  HeadingSemanticTag
> = {
  'heading-xxl': 'h1',
  'heading-xl': 'h2',
  'heading-lg': 'h3',
  'heading-md': 'h4',
  'heading-sm': 'h5',
  'heading-xs': 'h6',
};

const Heading: React.FunctionComponent<HeadingProps> = ({
  children,
  visualAppearance,
  color,
  removeMarginBottom,
  className,
}) => (
  <Typography
    className={className}
    color={color}
    component={visualAppearanceToSemanticTagMap[visualAppearance]}
    variant={visualAppearanceToSemanticTagMap[visualAppearance]}
    gutterBottom={!removeMarginBottom}
  >
    {children}
  </Typography>
);

export default Heading;
