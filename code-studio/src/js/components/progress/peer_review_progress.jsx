import React from 'react';
import Radium from 'radium';
import { connect } from 'react-redux';
import _ from 'lodash';

import { peerReviewShape } from './types';
import PeerReviewProgressDot from './peer_review_progress_dot.jsx';
import color from '../../color';

const PeerReviewProgress = React.createClass({
  propTypes: {
    peerReviewsRequired: React.PropTypes.number,
    peerReviewsPerformed: React.PropTypes.arrayOf(peerReviewShape)
  },

  render() {
    return (
      <div>
        {_.range(this.props.peerReviewsRequired).map( (index) =>
          <PeerReviewProgressDot
            key={index}
            peerReview={this.props.peerReviewsPerformed[index]}
            courseOverviewPage={true}
          />
        )}
      </div>
    );
  }
});

export default connect(state => ({
  peerReviewsRequired: state.peerReviewsRequired,
  peerReviewsPerformed: state.peerReviewsPerformed
}))(Radium(PeerReviewProgress));
