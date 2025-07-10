import Typography from '@mui/material/Typography';
import React, {ReactNode} from 'react';

import {FONT_SIZE} from '@/components/common/constants';
import {
  ComponentSize,
  RemoveMarginBottomProps,
} from '@/components/common/types';

type OverlineProps = RemoveMarginBottomProps & {
  /** Overline content */
  children: ReactNode;
  /** Overline size */
  size: Exclude<ComponentSize, 'xs'>;
  /** Overline color */
  color: 'primary' | 'secondary';
  /** ClassName passed by Contentful to apply styles that are set through Contentful native editor*/
  className?: string;
};

// Define font sizes based on the existing Contentful Overline size values
// that were set before using the MUI Typography component.
//
// The mapping below intentionally does not match the ComponentSize type one-to-one.
// This is to provide clearer dropdown options in the Contentful editor.
const overlineFontSizes: Record<Exclude<ComponentSize, 'xs'>, string> = {
  s: FONT_SIZE.xxs,
  m: FONT_SIZE.xs,
  l: FONT_SIZE.s,
};

const Overline: React.FunctionComponent<OverlineProps> = ({
  size,
  children,
  color,
  removeMarginBottom,
  className,
}) => {
  return (
    <Typography
      className={className}
      component="p"
      variant="overline"
      color={color === 'primary' ? 'primary.main' : 'text.secondary'}
      fontSize={overlineFontSizes[size]}
      gutterBottom={!removeMarginBottom}
    >
      {children}
    </Typography>
  );
};

export default Overline;
