import React from 'react';
import Radium from 'radium';
import { connect } from 'react-redux';

import { peerReviewShape } from './types';
import { createOutline, styles } from './progress_dot_styles';

const PeerReviewProgressDot = React.createClass({
  propTypes: {
    peerReview: peerReviewShape,
    courseOverviewPage: React.PropTypes.bool
  },

  linkText: function () {
    if (this.props.peerReview) {
      if (this.props.peerReview.submitted) {
        return 'Link to your completed review';
      } else {
        return 'Link to your in-progress review';
      }
    } else {
      return 'Reviews unavailable at this time';
    }
  },

  render() {
    let icon = this.props.peerReview ? this.props.peerReview.submitted ? 'fa-check' : '' : 'fa-lock';
    const iconElement = (
      <i
        className={`fa ${icon}`}
        style={[
              styles.dot.puzzle,
              this.props.courseOverviewPage && styles.dot.overview
            ]}
        >{!icon && '\u00a0'}
      </i>
      );

    const link = (
      <span style={styles.levelName}>
        {this.linkText()}
      </span>
    );

    if (this.props.peerReview) {
      return (
        <a
          key='link'
          href={this.props.peerReview && ('/peer_reviews/' + this.props.peerReview.id)}
          style={[styles.outer, {display: 'table-row'}]}
          >
          {iconElement}
          {link}
        </a>
      );
    } else {
      return (
        <div
          style={{display: 'table-row'}}>
          {iconElement}
          {link}
        </div>
      );
    }
  }
});

export default connect(state => ({
  peerReviewsPerformed: state.peerReviewsPerformed
}))(Radium(PeerReviewProgressDot));
