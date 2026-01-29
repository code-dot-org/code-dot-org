import React from 'react';

import jsonAssets from '@cdo/apps/jsonVideo/jsonVideoFiles';
import '@cdo/apps/jsonVideo/jsonVideoElement';

const LinkWrapper: React.FunctionComponent<
  React.AnchorHTMLAttributes<HTMLAnchorElement>
> = ({children, ...props}) => {
  if (props.href?.startsWith('https://example.com/json-video/')) {
    const filename = props.href.slice('https://example.com/json-video/'.length);
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
