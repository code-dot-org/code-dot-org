import React from 'react';

import jsonAssets from '@cdo/apps/json-video/json-video-files';
import '@cdo/apps/json-video/json-video-element';

const LinkWrapper: React.FunctionComponent<
  React.AnchorHTMLAttributes<HTMLAnchorElement>
> = ({children, ...props}) => {
  if (props.href?.startsWith('https://json-video.org/')) {
    const filename = props.href.slice('https://json-video.org/'.length);
    if (jsonAssets[filename]) {
      const uriEncodedJson = encodeURIComponent(jsonAssets[filename]);
      const uri = `data:application/json,${uriEncodedJson}`;
      return <json-video controls="true" src={uri} />;
    }
  }
  return <a {...props}>{children}</a>;
};

export const jsonVideoRehypeMap = {
  a: (props: React.ComponentPropsWithoutRef<'a'>) => <LinkWrapper {...props} />,
};
