import React from 'react';
import Radium from 'radium';
import { connect } from 'react-redux';
import _ from 'lodash';

import { stageShape, peerReviewShape } from './types';
import CourseProgressRow from './course_progress_row.jsx';
import PeerReviewSection from './peer_review_section.jsx';
import color from '../../color';

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
    professionalLearningCourse: React.PropTypes.bool,
    focusAreaPositions: React.PropTypes.arrayOf(React.PropTypes.number),
    stages: React.PropTypes.arrayOf(stageShape),
    peerReviewsRequired: React.PropTypes.number,
    peerReviewsPerformed: React.PropTypes.arrayOf(peerReviewShape)
  },

  render() {
    const groups = _.groupBy(this.props.stages, stage => (stage.flex_category || 'Content'));
    const peerReviewSection = true && (
      <div key='peer-review'>
        <h4
          id='peer-review'
          style={styles.flexHeader}
          >
          Peer Review
        </h4>
        <PeerReviewSection/>
      </div>
    );

    let count = 1;

    return (
      <div className='user-stats-block'>
        {_.map(groups, (stages, group) =>
          <div key={group}>
            <h4
              id={group.toLowerCase().replace(' ', '-')}
              style={[
                this.props.professionalLearningCourse ? styles.flexHeader : {display: 'none'},
                count === 1 && {margin: '2px 0 0 0'}
              ]}
            >
              {group}
            </h4>
            {stages.map(stage =>
              <CourseProgressRow
                stage={stage}
                key={stage.name}
                isFocusArea={this.props.focusAreaPositions.indexOf(count++) > -1}
                professionalLearningCourse={this.props.professionalLearningCourse}
              />
            )}
          </div>
        )}
        {peerReviewSection}
      </div>
    );
  }
});

export default connect(state => ({
  professionalLearningCourse: state.professionalLearningCourse,
  focusAreaPositions: state.focusAreaPositions,
  stages: state.stages,
  peerReviewsRequired: state.peerReviewsRequired,
  peerReviewsPerformed: state.peerReviewsPerformed
}))(Radium(CourseProgress));
