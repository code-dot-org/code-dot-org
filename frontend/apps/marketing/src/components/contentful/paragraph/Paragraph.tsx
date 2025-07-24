import Typography from '@mui/material/Typography';
import classNames from 'classnames';
import {ReactNode} from 'react';

import {RemoveMarginBottomProps} from '@/components/common/types';

type ParagraphSemanticTag = 'body1' | 'body2' | 'body3' | 'body4';

// Existing Contentful Paragraph visualAppearance values that
// were set before using the MUI Typography component.
type ParagraphVisualAppearance =
  | 'body-one'
  | 'body-two'
  | 'body-three'
  | 'body-four';

type ParagraphProps = RemoveMarginBottomProps & {
  /** Paragraph content */
  children: ReactNode;
  /** Paragraph visual appearance */
  visualAppearance: ParagraphVisualAppearance;
  /** Whether the paragraph text is strong */
  isStrong: boolean;
  /** Paragraph color */
  color: 'primary' | 'secondary';
  /** ClassName passed by contentful to apply styles that are set through contentful native editor*/
  className?: string;
};

// Maps Contentful Paragraph visualAppearance values with
// MUI Typography `variant` prop values.
const visualAppearanceToMuiTagMap: Record<
  ParagraphVisualAppearance,
  ParagraphSemanticTag
> = {
  'body-one': 'body1',
  'body-two': 'body2',
  'body-three': 'body3',
  'body-four': 'body4',
};

const Paragraph: React.FunctionComponent<ParagraphProps> = ({
  visualAppearance,
  isStrong,
  color,
  children,
  removeMarginBottom,
  className,
}) => (
  <Typography
    className={classNames(`paragraph--color-${color}`, className)}
    variant={visualAppearanceToMuiTagMap[visualAppearance]}
    gutterBottom={!removeMarginBottom}
    sx={{fontWeight: isStrong ? 600 : 400}}
  >
    {children}
  </Typography>
);

export default Paragraph;
