import React, {Component, PropTypes} from 'react';
import Radium from 'radium';
import ContentContainer from '../ContentContainer';
import ResourceCard from './ResourceCard';
import ResourceCardResponsiveContainer from './ResourceCardResponsiveContainer';
import i18n from "@cdo/locale";
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';

class CourseBlocksTools extends Component {
  static propTypes = {
    isEnglish: PropTypes.bool.isRequired,
  };

  cards = [
    {
      heading: i18n.courseBlocksToolsAppLab(),
      description: i18n.courseBlocksToolsAppLabDescription(),
      path: 'applab'
    },
    {
      heading: i18n.courseBlocksToolsGameLab(),
      description: i18n.courseBlocksToolsGameLabDescription(),
      path: 'gamelab'
    },
    {
      heading: i18n.courseBlocksToolsWebLab(),
      description: i18n.courseBlocksToolsWebLabDescription(),
      path: 'weblab'
    },
    {
      heading: i18n.courseBlocksToolsWidgets(),
      description: i18n.courseBlocksToolsWidgetsDescription(),
      path: 'widgets'
    },
    {
      heading: i18n.courseBlocksToolsInspire(),
      description: i18n.courseBlocksToolsInspireDescription(),
      path: 'inspire'
    },
    {
      heading: i18n.courseBlocksToolsVideo(),
      description: i18n.courseBlocksToolsVideoDescription(),
      path: 'videos'
    },
  ];

  render() {
    const { isEnglish } = this.props;

    const headingText = isEnglish
      ? i18n.courseBlocksToolsTitleTeacher()
      : i18n.courseBlocksToolsTitleNonEn();

    return (
      <ContentContainer
        heading={headingText}
        description={i18n.standaloneToolsDescription()}
      >
        <ResourceCardResponsiveContainer>
          {this.cards.map(
            (card, cardIndex) => (
              <ResourceCard
                key={cardIndex}
                title={card.heading}
                description={card.description}
                buttonText={i18n.learnMore()}
                link={pegasus(`/${card.path}`)}
              />
            )
          )}
        </ResourceCardResponsiveContainer>
      </ContentContainer>
    );
  }
}

export default Radium(CourseBlocksTools);
