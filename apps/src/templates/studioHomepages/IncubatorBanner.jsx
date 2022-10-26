import React from 'react';
import ContentContainer from '../ContentContainer';
import {TwoColumnActionBlock} from './TwoColumnActionBlock';

const IncubatorBanner = () => {
  return (
    <ContentContainer heading={'Incubator'}>
      <TwoColumnActionBlock
        imageUrl={
          '/shared/images/teacher-announcement/incubator-announcement.png'
        }
        subHeading={'Incubator'}
        description={'Preview some new experiences in the Code.org Incubator.'}
        buttons={[
          {
            url: '/incubator',
            text: 'Learn more'
          }
        ]}
        marginBottom={0}
      />
    </ContentContainer>
  );
};

export default IncubatorBanner;
