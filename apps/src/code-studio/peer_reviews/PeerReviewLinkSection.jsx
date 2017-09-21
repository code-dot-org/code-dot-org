import React from 'react';
import PropTypes from 'prop-types';
import FontAwesome from '@cdo/apps/templates/FontAwesome';

class PeerReviewLinkSection extends React.Component {
  static propTypes = {
    reviews: PropTypes.arrayOf(PropTypes.array).isRequired,
    escalatedReviewId: PropTypes.number,
    filterType: PropTypes.string.isRequired
  }

  getIconForStatus(status) {
    switch (status) {
      case 'accepted':
        return 'check';
      case 'rejected':
        return 'times';
      case 'escalated':
        return 'question';
      default:
        return 'circle-thin';
    }
  }

  renderSubmissionList() {
    return (
      <ul className="fa-ul">
        {
          this.props.reviews.map((submission, i) => {
            return (
              <li key={i}>
                <FontAwesome icon={`${this.getIconForStatus(submission[1])} fa-li`}/>
                <a key={i} href={`/peer_reviews/${submission[0]}`}>
                  Submission
                </a>
              </li>
            );
          })
        }
      </ul>
    );
  }

  render() {
    if (this.props.filterType === 'escalated') {
      return (
        <a key={0} href={`/peer_reviews/${this.props.escalatedReviewId}`}>
          Submission
        </a>
      );
    } else {
      return this.renderSubmissionList();
    }
  }
}

export default PeerReviewLinkSection;
