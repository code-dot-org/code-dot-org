import React from 'react';
import Radium from 'radium';
import ImageResourceCard from './ImageResourceCard';
import ContentContainer from '../ContentContainer';
import i18n from "@cdo/locale";
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';
import styleConstants from '../../styleConstants';

const contentWidth = styleConstants['content-width'];

const styles = {
  container: {
    width: contentWidth,
    display: "flex",
    justifyContent: "space-between",
    flexWrap: 'wrap'
  },
};


const TeacherResources = React.createClass({
  propTypes: {
    isRtl: React.PropTypes.bool.isRequired
  },

  render() {
    const { isRtl } = this.props;
    const planUrl = pegasus('/teacher-dashboard#/plan');
    const volunteerUrl = pegasus('/volunteer/local');

    return (
      <ContentContainer
        heading={i18n.resources()}
        isRtl={isRtl}
      >
        <div style={styles.container}>
          <ImageResourceCard
            title={i18n.teacherCommunity()}
            description={i18n.teacherCommunityDescription()}
            image="teacher-community"
            buttonText={i18n.joinCommunity()}
            link="https://forum.code.org"
            isRtl={isRtl}
          />
          <ImageResourceCard
            title={i18n.teacherTraining()}
            description={i18n.professionalLearningDescription()}
            image="professional-learning"
            buttonText={i18n.learnMore()}
            link="/my-professional-learning"
            isRtl={isRtl}
          />
          <ImageResourceCard
            title={i18n.standardsAndFramework()}
            description={i18n.standardsAndFrameworkDescription()}
            image="standards-framework"
            buttonText={i18n.reviewDocuments()}
            link={planUrl}
            isRtl={isRtl}
          />
          <ImageResourceCard
            title={i18n.findGuestSpeaker()}
            description={i18n.findGuestSpeakerDescription()}
            image="guest-speaker"
            buttonText={i18n.inspireStudents()}
            link={volunteerUrl}
            isRtl={isRtl}
          />
        </div>
      </ContentContainer>
    );
  }
});

export default Radium(TeacherResources);
