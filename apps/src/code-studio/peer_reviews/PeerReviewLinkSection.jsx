import React from 'react';
import PropTypes from 'prop-types';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import _ from 'lodash';

class PeerReviewLinkSection extends React.Component {
  static propTypes = {
    submissions: PropTypes.arrayOf(PropTypes.array).isRequired,
    escalatedSubmissionId: PropTypes.number
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
    let submissions;

    if (this.props.escalatedSubmissionId) {
      submissions = _.filter(this.props.submissions, (submission) => {
        return submission[0] !== this.props.escalatedSubmissionId;
      });
    } else {
      submissions = this.props.submissions;
    }

    return (
      <ul className="fa-ul">
        {
          submissions.map((submission, i) => {
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
    return (
      <div>
        {this.props.escalatedSubmissionId && [(
          <a key={0} href={`/peer_reviews/${this.props.escalatedSubmissionId}`}>
            Esc. Submission
          </a>
        ),(<hr key={1} style={{borderColor: 'black', margin: '0px'}}/>)]}
        {this.renderSubmissionList()}
      </div>
    );
  }
}

export default PeerReviewLinkSection;
