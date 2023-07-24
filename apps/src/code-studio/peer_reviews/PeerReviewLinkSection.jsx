import React from 'react';
import PropTypes from 'prop-types';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import moment from 'moment';

class PeerReviewLinkSection extends React.Component {
  static propTypes = {
    reviews: PropTypes.arrayOf(PropTypes.array).isRequired,
    escalatedReviewId: PropTypes.number,
  };

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

  render() {
    return (
      <ul className="fa-ul">
        {this.props.reviews.map((submission, i) => {
          return (
            <li key={i} style={{whiteSpace: 'nowrap'}}>
              <FontAwesome
                icon={`${this.getIconForStatus(submission[1])} fa-li`}
              />
              <a key={i} href={`/peer_reviews/${submission[0]}`}>
                {moment(submission[2]).fromNow()}
              </a>
            </li>
          );
        })}
      </ul>
    );
  }
}

export default PeerReviewLinkSection;
