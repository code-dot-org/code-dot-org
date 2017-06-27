import React from 'react';
import ResourceCard from './ResourceCard';
import ContentContainer from './ContentContainer';
import i18n from "@cdo/locale";

const StudentResources = React.createClass({
  propTypes: {
    isRtl: React.PropTypes.bool.isRequired
  },

  render() {
    return (
      <ContentContainer heading={i18n.resources()} isRtl={false}>
        <ResourceCard
          title={i18n.courses()}
          description={i18n.coursesCardDescription()}
          image="../../static/navcard-placeholder.png"
          buttonText={i18n.coursesCardAction()}
          link="/courses"
          isRtl={false}
        />
        <ResourceCard
          title={i18n.projectGalleryCard()}
          description={i18n.projectGalleryCardDescription()}
          image="../../static/navcard-placeholder.png"
          buttonText={i18n.projectGalleryCardAction()}
          link="/gallery"
          isRtl={false}
        />
      </ContentContainer>
    );
  }
});

export default StudentResources;
