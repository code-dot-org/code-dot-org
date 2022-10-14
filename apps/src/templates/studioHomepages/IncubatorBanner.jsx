import React from 'react';
import ContentContainer from '../ContentContainer';
import {TwoColumnActionBlock} from './TwoColumnActionBlock';
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';

const IncubatorBanner = () => {
  return (
    <ContentContainer heading={'Incubator'}>
      <TwoColumnActionBlock
        imageUrl={pegasus('/images/athome/fill-970x562/app-lab.png')}
        subHeading={'Incubator'}
        description={'Preview some new experiences in the Code.org Incubator.'}
        buttons={[
          {
            url: '/incubator',
            text: 'Learn more'
          }
        ]}
      />
    </ContentContainer>
  );
};

export default IncubatorBanner;
