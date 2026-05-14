import React from 'react';

import '@cdo/apps/jsonVideo/jsonVideoElement';
import TutorVideo from './TutorVideo';

const LinkWrapper: React.FunctionComponent<
  React.AnchorHTMLAttributes<HTMLAnchorElement>
> = ({children, ...props}) => {
  if (props.href?.includes('assets/js/json')) {
    return <TutorVideo href={props.href} />;
  }
  return <a {...props}>{children}</a>;
};

export const jsonVideoRehypeMap = {
  a: (props: React.ComponentPropsWithoutRef<'a'>) => <LinkWrapper {...props} />,
};
