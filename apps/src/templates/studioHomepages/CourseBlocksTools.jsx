import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
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

const CourseBlocksTools = React.createClass({
  propTypes: {
    isEnglish: React.PropTypes.bool.isRequired,
    isRtl: React.PropTypes.bool.isRequired,
    codeOrgUrlPrefix: React.PropTypes.string.isRequired
  },

  componentDidMount() {
    $('#applab').appendTo(ReactDOM.findDOMNode(this.refs.applab)).show();
    $('#widgets').appendTo(ReactDOM.findDOMNode(this.refs.widgets)).show();
    $('#gamelab').appendTo(ReactDOM.findDOMNode(this.refs.gamelab)).show();
    $('#weblab').appendTo(ReactDOM.findDOMNode(this.refs.weblab)).show();
  },

  render() {
    const headingText = this.props.isEnglish
      ? i18n.courseBlocksToolsTitleTeacher()
      : i18n.courseBlocksToolsTitleNonEn();

    const cards = [
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

    return (
      <ContentContainer
        heading={headingText}
        description={i18n.standaloneToolsDescription()}
        isRtl={this.props.isRtl}
      >
        {[0,3].map(
          (startIndex, rowIndex) => (
            <div
              key={rowIndex}
              style={styles.container}
            >
              {cards.slice(startIndex, startIndex + 3).map(
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
          )
        )}
      </ContentContainer>
    );
  }
});

export default CourseBlocksTools;
