import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium';
import ContentContainer from '../ContentContainer';
import ResourceCard from './ResourceCard';
import ResourceCardResponsiveContainer from './ResourceCardResponsiveContainer';
import i18n from '@cdo/locale';
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';

class CourseBlocksTools extends Component {
  static propTypes = {
    isEnglish: PropTypes.bool.isRequired
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
      callout: `(${i18n.beta()})`,
      description: i18n.courseBlocksToolsWebLabDescription(),
      path: 'weblab'
    },
    {
      heading: i18n.csJourneys(),
      callout: i18n.newExclame(),
      description: i18n.csJourneysDescription(),
      path: 'csjourneys'
    },
    {
      heading: i18n.courseBlocksToolsVideo(),
      description: i18n.courseBlocksToolsVideoDescription(),
      path: 'videos'
    },
    {
      heading: i18n.courseBlocksToolsWidgets(),
      description: i18n.courseBlocksToolsWidgetsDescription(),
      path: 'widgets'
    }
  ];

  render() {
    const {isEnglish} = this.props;

    const headingText = isEnglish
      ? i18n.courseBlocksToolsTitleTeacher()
      : i18n.courseBlocksToolsTitleNonEn();

    return (
      <div id="uitest-course-blocks-tools">
        <ContentContainer
          heading={headingText}
          description={i18n.standaloneToolsDescription()}
        >
          <ResourceCardResponsiveContainer>
            {this.cards.map((card, cardIndex) => (
              <ResourceCard
                key={cardIndex}
                title={card.heading}
                callout={card.callout}
                description={card.description}
                buttonText={i18n.learnMore()}
                link={pegasus(`/${card.path}`)}
              />
            ))}
          </ResourceCardResponsiveContainer>
        </ContentContainer>
      </div>
    );
  }
}

export default Radium(CourseBlocksTools);
