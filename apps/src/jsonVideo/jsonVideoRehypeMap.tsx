import React from 'react';

import '@cdo/apps/jsonVideo/jsonVideoElement';
import TutorVideo from './TutorVideo';

const JSON_VIDEO_PATH_PREFIXES = ['/assets/js/json/', '/blockly/js/json/'];

const LinkWrapper: React.FunctionComponent<
  React.AnchorHTMLAttributes<HTMLAnchorElement>
> = ({children, ...props}) => {
  if (
    props.href &&
    JSON_VIDEO_PATH_PREFIXES.some(prefix => props.href?.includes(prefix))
  ) {
    return <TutorVideo href={props.href} />;
  }
  return <a {...props}>{children}</a>;
};

export const jsonVideoRehypeMap = {
  a: (props: React.ComponentPropsWithoutRef<'a'>) => <LinkWrapper {...props} />,
};
