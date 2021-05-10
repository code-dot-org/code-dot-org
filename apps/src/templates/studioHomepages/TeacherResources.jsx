import React, {Component} from 'react';
import ImageResourceCard from './ImageResourceCard';
import ContentContainer from '../ContentContainer';
import i18n from '@cdo/locale';
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';
import styleConstants from '../../styleConstants';

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
            buttonText={i18n.learnMore()}
            link="/my-professional-learning"
          />
          <ImageResourceCard
            title={i18n.csJourneys()}
            callout={i18n.newExclame()}
            description={i18n.csJourneysDescription()}
            image="csjourneys.png"
            buttonText={i18n.learnMore()}
            link={pegasus('/csjourneys')}
          />
          <ImageResourceCard
            title={i18n.standardsAndFramework()}
            description={i18n.standardsAndFrameworkDescription()}
            image="standardsandframework.png"
            buttonText={i18n.reviewDocuments()}
            link={pegasus('/lesson_plans')}
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
    flexWrap: 'wrap'
  }
};
