import React from 'react';
import ResourceCard from './ResourceCard';
import ContentBox from './ContentBox';
import i18n from "@cdo/locale";

const StudentResources = React.createClass({

  render() {
    return (
      <ContentBox heading={i18n.resources()}>
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
      </ContentBox>
    );
  }
});

export default StudentResources;
