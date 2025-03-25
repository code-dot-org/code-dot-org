import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import React from 'react';

import HelpTabContents from '@cdo/apps/templates/instructions/HelpTabContents';

const HelpAndTips: React.FunctionComponent = () => {
  const {levelProperties} = useCodebridgeContext();
  const {mapReference, referenceLinks, helpVideos} = levelProperties;
  const helpVideo = helpVideos ? helpVideos[0] : null;
  return (
    <HelpTabContents
      videoData={helpVideo}
      mapReference={mapReference}
      referenceLinks={referenceLinks}
      openReferenceLinksInNewTab
    />
  );
};

export default HelpAndTips;
