import React from 'react';

import i18n from '@cdo/locale';

import ContentContainer from '../ContentContainer';

import TwoColumnActionBlock from './TwoColumnActionBlock';

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
            text: i18n.seeIncubatorProjects(),
          },
        ]}
        marginBottom={'0'}
      />
    </ContentContainer>
  );
};

export default IncubatorBanner;
