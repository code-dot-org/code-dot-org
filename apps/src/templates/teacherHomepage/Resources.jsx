import React from 'react';
import ResourceCard from './ResourceCard';
import CollapsibleSection from './CollapsibleSection';
import i18n from "@cdo/locale";

const Resources = React.createClass({
  propTypes: {
    type: React.PropTypes.oneOf(['student', 'teacher']).isRequired
  },

  render() {
    const { type } = this.props;
    if (type === 'teacher') {
      return (
        <CollapsibleSection header={i18n.resources()}>
          <ResourceCard
            title={i18n.teacherCommunity()}
            description={i18n.teacherCommunityDescription()}
            image="../../static/navcard-placeholder.png"
            buttonText={i18n.joinCommunity()}
            link="https://forum.code.org"
          />
          <ResourceCard
            title={i18n.professionalLearning()}
            description={i18n.professionalLearningDescription()}
            image="../../static/navcard-placeholder.png"
            buttonText={i18n.learnMore()}
            link="/my-professional-learning"
          />
          <ResourceCard
            title={i18n.standardsAndFramework()}
            description={i18n.standardsAndFrameworkDescription()}
            image="../../static/navcard-placeholder.png"
            buttonText={i18n.reviewDocuments()}
            link="https://code.org/teacher-dashboard#/plan"
          />
          <ResourceCard
            title={i18n.findGuestSpeaker()}
            description={i18n.findGuestSpeakerDescription()}
            image="../../static/navcard-placeholder.png"
            buttonText={i18n.inspireStudents()}
            link="https://code.org/volunteer/local"
          />
        </CollapsibleSection>
      );
    }
    if (type === 'student') {
      return (
        <CollapsibleSection header={i18n.resources()}>
          <div>Brendan, you can put student-specific ResourceCards here.</div>
        </CollapsibleSection>
      );
    }
  }
});

export default Resources;
