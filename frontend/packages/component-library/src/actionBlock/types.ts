import {HTMLAttributes} from 'react';

import {LinkButtonProps} from '@/button';

export interface ActionBlockProps extends HTMLAttributes<HTMLDivElement> {
  /** Action Block title */
  title?: string;
  /** Action Block description */
  description?: string;
  /** Action Block image */
  image?: string;
  /** Action Block overline */
  overline?: string;
  /** Action Block Details */
  details?: {
    /** Detail label */
    label: string;
    /** Detail text */
    description: string;
  };
  /** Primary button props */
  primaryButton?: LinkButtonProps;
  /** Secondary button props */
  secondaryButton?: LinkButtonProps;
  /** Action Block background */
  background?: 'primary' | 'secondary';
  /** Action Block custom className */
  className?: string;
}
