import React from 'react';
import ResourceCard from './ResourceCard';
import CollapsibleSection from './CollapsibleSection';
import i18n from "@cdo/locale";

const TeacherResources = React.createClass({
  propTypes: {
    codeOrgUrlPrefix: React.PropTypes.string.isRequired
  },

  render() {
    const { codeOrgUrlPrefix } = this.props;
    const planUrl = `${codeOrgUrlPrefix}/teacher-dashboard#/plan`;
    const volunteerUrl = `${codeOrgUrlPrefix}/volunteer/local`;

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
          link={planUrl}
        />
        <ResourceCard
          title={i18n.findGuestSpeaker()}
          description={i18n.findGuestSpeakerDescription()}
          image="../../static/navcard-placeholder.png"
          buttonText={i18n.inspireStudents()}
          link={volunteerUrl}
        />
      </CollapsibleSection>
    );
  }
});

export default TeacherResources;
