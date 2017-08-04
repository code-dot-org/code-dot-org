import React from 'react';
import ContentContainer from '../ContentContainer';
import ResourceCard from './ResourceCard';
import styleConstants from '../../styleConstants';
import i18n from "@cdo/locale";

const pegasusContentWidth = styleConstants['content-width'];

const styles = {
  container: {
    width: pegasusContentWidth,
    display: "flex",
    justifyContent: "space-between"
  }
};

const CourseBlocksGradeBands = React.createClass({
  propTypes: {
    isEnglish: React.PropTypes.bool.isRequired,
    isRtl: React.PropTypes.bool.isRequired,
    codeOrgUrlPrefix: React.PropTypes.string.isRequired
  },

  render() {
    const cards = [
      {
        heading: i18n.courseBlocksGradeBandsK5(),
        description: i18n.courseBlocksGradeBandsK5Description(),
        path: 'applab'
      },
      {
        heading: i18n.courseBlocksGradeBands612(),
        description: i18n.courseBlocksGradeBands612Description(),
        path: 'gamelab'
      },
      {
        heading: i18n.courseBlocksGradeBandsUniversity(),
        description: i18n.courseBlocksGradeBandsUniversityDescription(),
        path: 'weblab'
      }
    ];

    return (
      <ContentContainer
        heading={i18n.courseBlocksToolsTitleTeacher()}
        description={i18n.standaloneToolsDescription()}
        isRtl={this.props.isRtl}
      >
        <div style={styles.container}>
          {cards.slice(0, 3).map(
            (card, cardIndex) => (
              <ResourceCard
                key={cardIndex}
                title={card.heading}
                description={card.description}
                buttonText={i18n.learnMore()}
                link={`${this.props.codeOrgUrlPrefix}/${card.path}`}
                isRtl={this.props.isRtl}
                isJumbo = {true}
              />
            )
          )}
        </div>
      </ContentContainer>
    );
  }
});

export default CourseBlocksGradeBands;
