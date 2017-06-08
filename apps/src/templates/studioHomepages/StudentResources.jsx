import React from 'react';
import ResourceCard from './ResourceCard';
import ContentContainer from './ContentContainer';
import i18n from "@cdo/locale";

const StudentResources = React.createClass({

  render() {
    return (
      <ContentContainer heading={i18n.resources()}>
        <ResourceCard
          title={i18n.courses()}
          description={i18n.coursesCardDescription()}
          image="../../static/navcard-placeholder.png"
          buttonText={i18n.coursesCardAction()}
          link="/courses"
        />
        <ResourceCard
          title={i18n.projectGalleryCard()}
          description={i18n.projectGalleryCardDescription()}
          image="../../static/navcard-placeholder.png"
          buttonText={i18n.projectGalleryCardAction()}
          link="/gallery"
        />
      </ContentContainer>
    );
  }
});

export default StudentResources;
