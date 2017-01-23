import React from 'react';
import Radium from 'radium';
import { connect } from 'react-redux';
import _ from 'lodash';

import { stageShape } from './types';
import CourseProgressRow from './course_progress_row.jsx';
import HrefButton from '@cdo/apps/templates/HrefButton';
import color from "../../../util/color";
import i18n from '@cdo/locale';

const styles = {
  flexHeader: {
    padding: '8px 11px',
    margin: '20px 0 0 0',
    borderRadius: 5,
    background: color.cyan,
    color: color.white
  }
};

/**
 * Stage progress component used in level header and course overview.
 */
const CourseProgress = React.createClass({
  propTypes: {
    onOverviewPage: React.PropTypes.bool.isRequired,

    // redux provided
    perLevelProgress: React.PropTypes.object.isRequired,
    scriptName: React.PropTypes.string.isRequired,
    professionalLearningCourse: React.PropTypes.bool,
    focusAreaPositions: React.PropTypes.arrayOf(React.PropTypes.number),
    stages: React.PropTypes.arrayOf(stageShape),
    peerReviewStage: stageShape
  },

  render() {
    const {
      stages,
      peerReviewStage,
      professionalLearningCourse,
      focusAreaPositions,
      scriptName
    } = this.props;
    const groups = _.groupBy(stages, stage => (stage.flex_category || 'Content'));
    // Add an additional group for any peer reviews
    if (peerReviewStage) {
      // peerReviewStage.flex_category will always be "Peer Review" here
      groups[peerReviewStage.flex_category] = [peerReviewStage];
    }

    let count = 1;

    const hasLevelProgress = Object.keys(this.props.perLevelProgress).length > 0;

    return (
      <div>
        {this.props.onOverviewPage &&
          <HrefButton
            href={`/s/${scriptName}/next.next`}
            text={hasLevelProgress ? i18n.continue() : i18n.tryNow()}
            type="primary"
            style={{marginBottom: 10}}
          />
        }
        {this.props.onOverviewPage &&
          <HrefButton
            href="//support.code.org"
            text={i18n.getHelp()}
            type="default"
            style={{marginLeft: 10, marginBottom: 10}}
          />
        }
        <div className="user-stats-block">
          {_.map(groups, (stages, group) =>
            <div key={group}>
              <h4
                id={group.toLowerCase().replace(' ', '-')}
                style={[
                  professionalLearningCourse ? styles.flexHeader : {display: 'none'},
                  count === 1 && {margin: '2px 0 0 0'}
                ]}
              >
                {group}
              </h4>
              {stages.map(stage =>
                <CourseProgressRow
                  stage={stage}
                  key={stage.name}
                  isFocusArea={focusAreaPositions.indexOf(count++) > -1}
                  professionalLearningCourse={professionalLearningCourse}
                />
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
});

export default connect(state => ({
  perLevelProgress: state.progress.levelProgress,
  scriptName: state.progress.scriptName,
  professionalLearningCourse: state.progress.professionalLearningCourse,
  focusAreaPositions: state.progress.focusAreaPositions,
  stages: state.progress.stages,
  peerReviewStage: state.progress.peerReviewStage
}))(Radium(CourseProgress));
