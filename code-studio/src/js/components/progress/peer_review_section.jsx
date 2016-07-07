import React from 'react';
import Radium from 'radium';
import { connect } from 'react-redux';

import color from '../../color';
import { peerReviewShape } from './types';
import PeerReviewProgress from './peer_review_progress';
import { styles } from './progress_row_styles';

const PeerReviewSection = React.createClass({
  propTypes: {
    peerReviewsRequired: React.PropTypes.number,
    peerReviewsPerformed: React.PropTypes.arrayOf(peerReviewShape),
    professionalLearningCourse: React.PropTypes.bool
  },

  render() {
    return (
      <div style={[
        styles.row,
        this.props.professionalLearningCourse && {background: color.white}
      ]}>
        <div style={styles.stageName}>
          You must review {this.props.peerReviewsRequired} assignments for this unit
        </div>
        <PeerReviewProgress/>
      </div>
    );
  }
});

export default connect(state => ({
  professionalLearningCourse: state.professionalLearningCourse,
  peerReviewsRequired: state.peerReviewsRequired,
  peerReviewsPerformed: state.peerReviewsPerformed
}))(Radium(PeerReviewSection));
