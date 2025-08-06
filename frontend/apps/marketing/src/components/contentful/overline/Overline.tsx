import Typography from '@mui/material/Typography';
import classNames from 'classnames';
import React, {ReactNode} from 'react';

import {
  ComponentSize,
  RemoveMarginBottomProps,
  TypographyColor,
} from '@/components/common/types';

type OverlineProps = RemoveMarginBottomProps & {
  /** Overline content */
  children: ReactNode;
  /** Overline size */
  size: Exclude<ComponentSize, 'xs'>;
  /** Overline color */
  color: TypographyColor;
  /** ClassName passed by Contentful to apply styles that are set through Contentful native editor*/
  className?: string;
};

const Overline: React.FunctionComponent<OverlineProps> = ({
  children,
  size = 'm',
  color = 'primary',
  removeMarginBottom,
  className,
}) => {
  return (
    <Typography
      className={classNames(
        `overline--color-${color}`,
        `overline--size-${size}`,
        className,
      )}
      component="p"
      variant="overline"
      gutterBottom={!removeMarginBottom}
    >
      {children}
    </Typography>
  );
};

export default Overline;
