import React, {Component} from 'react';
//import PropTypes from 'prop-types';
import javalabMsg from '@cdo/javalab/locale';
import Comment from './codeReview/Comment';
import CommentEditor from './codeReview/CommentEditor';

// const commentShape = {
//   id: PropTypes.number.isRequired,
//   name: PropTypes.string.isRequired,
//   comment: PropTypes.string.isRequired,
//   timestampString: PropTypes.string.isRequired,
//   isResolved: PropTypes.bool,
//   isFromTeacher: PropTypes.bool,
//   isFromProjectOwner: PropTypes.bool,
//   isFromOlderVersionOfProject: PropTypes.bool
// };

export default class ReviewTab extends Component {
  // static propTypes = {
  //   comments: PropTypes.arrayOf(commentShape)
  // };

  state = {
    readyForReview: false
  };

  renderReadyForReviewCheckbox() {
    const readyForReview = this.state.readyForReview;

    return (
      <div style={styles.checkboxContainer}>
        <label style={styles.label}>
          <input
            type="checkbox"
            checked={readyForReview}
            onChange={() => this.setState({readyForReview: !readyForReview})}
            style={styles.checkbox}
          />
          {javalabMsg.enablePeerReview()}
        </label>
      </div>
    );
  }

  render() {
    return (
      <div style={styles.reviewsContainer}>
        {this.renderReadyForReviewCheckbox()}
        {demoComments.map(commentProps => {
          return <Comment {...commentProps} />;
        })}
        <CommentEditor />
      </div>
    );
  }
}

const styles = {
  reviewsContainer: {
    margin: '10px 5%'
  },
  label: {
    margin: 0
  },
  checkbox: {margin: '0 7px 0 0'},
  checkboxContainer: {
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-end',
    margin: '10px 0'
  }
};

const demoComments = [
  {
    name: 'Another Student',
    comment:
      "Don't worry about the world coming to an end today. It's already tomorrow in Australia.",
    timestampString: '2020/01/01 at 9:30 AM',
    isResolved: false,
    isFromTeacher: false,
    isFromProjectOwner: false,
    isFromOlderVersionOfProject: false
  },
  {
    name: 'Older Version',
    comment:
      "Don't worry about the world coming to an end today. It's already tomorrow in Australia.",
    timestampString: '2020/01/01 at 9:30 AM',
    isResolved: true,
    isFromTeacher: false,
    isFromProjectOwner: false,
    isFromOlderVersionOfProject: true
  },
  {
    name: 'Resolved Comment',
    comment:
      "Don't worry about the world coming to an end today. It's already tomorrow in Australia.",
    timestampString: '2020/01/01 at 9:30 AM',
    isResolved: true,
    isFromTeacher: false,
    isFromProjectOwner: false,
    isFromOlderVersionOfProject: false
  },
  {
    name: 'Mr. Teacher',
    comment:
      "Don't worry about the world coming to an end today. It's already tomorrow in Australia.",
    timestampString: '2020/01/01 at 9:30 AM',
    isResolved: false,
    isFromTeacher: true,
    isFromProjectOwner: false,
    isFromOlderVersionOfProject: false
  },
  {
    name: 'Project Owner',
    comment:
      "Don't worry about the world coming to an end today. It's already tomorrow in Australia.",
    timestampString: '2020/01/01 at 9:30 AM',
    isResolved: false,
    isFromTeacher: false,
    isFromProjectOwner: true,
    isFromOlderVersionOfProject: false
  }
];
