import {HTMLAttributes} from 'react';

import {LinkButtonProps} from '@/button';
import {ImageProps} from '@/image';
import Video, {VideoProps} from '@/video';

export interface ActionBlockProps extends HTMLAttributes<HTMLDivElement> {
  /** Action Block title */
  title?: string;
  /** Action Block description */
  description?: string;
  /** Action Block image */
  image?: ImageProps;
  /** Action Block video component. We use this composition here to allow using ActionBlock component for ssr pages.
   * More context can be found in this slack thread: https://codedotorg.slack.com/archives/C07UW4ED66Q/p1744640489709969
   * */
  VideoComponent?: typeof Video;
  /** ActionBlock video */
  video?: VideoProps;
  /** Action Block overline */
  overline?: string;
  /** Action Block tag */
  tag?: string;
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

export interface ActionBlockWrapperProps
  extends HTMLAttributes<HTMLDivElement> {
  /** Action Block custom className */
  className?: ActionBlockProps['className'];
  /** Action Block background */
  background?: ActionBlockProps['background'];
}
