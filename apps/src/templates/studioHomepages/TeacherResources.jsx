import React, {Component} from 'react';

import {pegasus} from '@cdo/apps/util/urlHelpers';
import i18n from '@cdo/locale';

import styleConstants from '../../styleConstants';
import ContentContainer from '../ContentContainer';

import ImageResourceCard from './ImageResourceCard';

const contentWidth = styleConstants['content-width'];

export default class TeacherResources extends Component {
  render() {
    return (
      <ContentContainer heading={i18n.resources()}>
        <div style={styles.container}>
          <ImageResourceCard
            title={i18n.teacherCommunity()}
            description={i18n.teacherCommunityDescription()}
            image="teachercommunity.png"
            buttonText={i18n.joinCommunity()}
            link="https://forum.code.org"
          />
          <ImageResourceCard
            title={i18n.professionalLearning()}
            description={i18n.professionalLearningDescription()}
            image="professionallearning.png"
            buttonText={i18n.exploreProfessionalLearning()}
            link={pegasus('/educate/professional-learning')}
          />
          <ImageResourceCard
            title={i18n.csJourneys()}
            callout={i18n.newExclame()}
            description={i18n.csJourneysDescription()}
            image="csjourneys.png"
            buttonText={i18n.learnMoreCsJourneys()}
            link={pegasus('/csjourneys')}
          />
          <ImageResourceCard
            title={i18n.curriculumCatalogHeaderTitle()}
            description={i18n.curriculumCatalogDescription()}
            image="standardsandframework.png"
            buttonText={i18n.exploreCurriculumCatalog()}
            link={'/catalog'}
          />
        </div>
      </ContentContainer>
    );
  }
}

const styles = {
  container: {
    width: contentWidth,
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
};
