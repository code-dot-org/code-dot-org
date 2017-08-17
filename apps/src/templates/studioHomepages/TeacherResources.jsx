import React from 'react';
import ResourceCard from './ResourceCard';
import ContentContainer from '../ContentContainer';
import i18n from "@cdo/locale";
import color from "../../util/color";
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';

const styles = {
  spacer: {
    width: 20,
    float: 'left',
    color: color.white
  }
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
        <ResourceCard
          title={i18n.teacherCommunity()}
          description={i18n.teacherCommunityDescription()}
          image="teacher-community"
          buttonText={i18n.joinCommunity()}
          link="https://forum.code.org"
          isRtl={isRtl}
        />
        <div style={styles.spacer}>.</div>
        <ResourceCard
          title={i18n.professionalLearning()}
          description={i18n.professionalLearningDescription()}
          image="professional-learning"
          buttonText={i18n.learnMore()}
          link="/my-professional-learning"
          isRtl={isRtl}
        />
        <ResourceCard
          title={i18n.standardsAndFramework()}
          description={i18n.standardsAndFrameworkDescription()}
          image="standards-framework"
          buttonText={i18n.reviewDocuments()}
          link={planUrl}
          isRtl={isRtl}
        />
        <div style={styles.spacer}>.</div>
        <ResourceCard
          title={i18n.findGuestSpeaker()}
          description={i18n.findGuestSpeakerDescription()}
          image="guest-speaker"
          buttonText={i18n.inspireStudents()}
          link={volunteerUrl}
          isRtl={isRtl}
        />
      </ContentContainer>
    );
  }
});

export default TeacherResources;
