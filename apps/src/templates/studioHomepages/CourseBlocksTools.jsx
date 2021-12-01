import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium';
import ContentContainer from '../ContentContainer';
import ResourceCard from './ResourceCard';
import ResourceCardResponsiveContainer from './ResourceCardResponsiveContainer';
import i18n from '@cdo/locale';
import {pegasus, studio} from '@cdo/apps/lib/util/urlHelpers';

class CourseBlocksTools extends Component {
  static propTypes = {
    isEnglish: PropTypes.bool.isRequired,
    showAiCard: PropTypes.bool
  };

  constructor(props) {
    super(props);
    this.cards = [
      {
        heading: i18n.courseBlocksToolsAppLab(),
        description: i18n.courseBlocksToolsAppLabDescription(),
        link: pegasus('/applab')
      },
      {
        heading: i18n.courseBlocksToolsGameLab(),
        description: i18n.courseBlocksToolsGameLabDescription(),
        link: pegasus('/gamelab')
      },
      {
        heading: i18n.courseBlocksToolsWebLab(),
        description: i18n.courseBlocksToolsWebLabDescription(),
        link: pegasus('/weblab')
      },
      {
        heading: i18n.csJourneys(),
        callout: i18n.newExclame(),
        description: i18n.csJourneysDescription(),
        link: pegasus('/csjourneys')
      },
      {
        heading: i18n.courseBlocksToolsVideo(),
        description: i18n.courseBlocksToolsVideoDescription(),
        link: pegasus('/videos')
      }
    ];
    if (props.isEnglish && props.showAiCard) {
      this.cards.push({
        heading: i18n.courseBlocksToolsAi(),
        callout: i18n.newExclame(),
        description: i18n.courseBlocksToolsAiDescription(),
        link: studio('/s/aiml-2021')
      });
    } else {
      this.cards.push({
        heading: i18n.courseBlocksToolsWidgets(),
        description: i18n.courseBlocksToolsWidgetsDescription(),
        link: pegasus('/widgets')
      });
    }
  }

  render() {
    const headingText = this.props.isEnglish
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
                link={card.link}
              />
            ))}
          </ResourceCardResponsiveContainer>
        </ContentContainer>
      </div>
    );
  }
}

export default Radium(CourseBlocksTools);
