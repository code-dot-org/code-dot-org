import React from 'react';

import HelpTabContents from '@cdo/apps/templates/instructions/HelpTabContents';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

const HelpAndTips: React.FunctionComponent = () => {
  const mapReference = useAppSelector(
    state => state.lab.levelProperties?.mapReference
  );
  const referenceLinks = useAppSelector(
    state => state.lab.levelProperties?.referenceLinks
  );
  const helpVideos = useAppSelector(
    state => state.lab.levelProperties?.helpVideos
  );
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
