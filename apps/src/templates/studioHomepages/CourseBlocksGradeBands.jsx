import React, {Component, PropTypes} from 'react';
import ContentContainer from '../ContentContainer';
import ResourceCard from './ResourceCard';
import styleConstants from '../../styleConstants';
import i18n from "@cdo/locale";
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';

const contentWidth = styleConstants['content-width'];

const styles = {
  container: {
    width: contentWidth,
    display: "flex",
    justifyContent: "space-between"
  }
};

class CourseBlocksGradeBands extends Component {
  static propTypes = {
    isEnglish: PropTypes.bool.isRequired,
    isRtl: PropTypes.bool.isRequired
  };

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
        heading={i18n.courseBlocksGradeBandsHeading()}
        description={i18n.courseBlocksGradeBandsDescription()}
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
                link={pegasus(`/${card.path}`)}
                isRtl={this.props.isRtl}
                isJumbo={true}
              />
            )
          )}
        </div>
      </ContentContainer>
    );
  }
}

export default CourseBlocksGradeBands;
