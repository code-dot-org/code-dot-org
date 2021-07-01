import React, {Component} from 'react';
import javalabMsg from '@cdo/javalab/locale';
import color from '../../util/color';

export default class ReviewTab extends Component {
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

  renderCodeReviewComment() {
    return (
      <div>
        <div style={styles.commentHeaderContainer}>
          <span style={styles.name}>Ben Brooks</span>
          <div
            className="fa fa-ellipsis-h"
            style={styles.ellipsisMenu}
            onClick={() => console.log('hello!')}
          />
          <span style={styles.timestamp}>2020/01/01 at 9:30 AM</span>
        </div>
        <div style={styles.comment}>
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry. Lorem Ipsum has been the industry's standard dummy text ever
          since the 1500s, when an unknown printer took a galley of type and
          scrambled it to make a type specimen book. It has survived not only
          five centuries, but also the leap into electronic typesetting,
          remaining essentially unchanged. It was popularised in the 1960s with
          the release of Letraset sheets containing Lorem Ipsum passages, and
          more recently with desktop publishing software like Aldus PageMaker
          including versions of Lorem Ipsum.
        </div>
      </div>
    );
  }

  render() {
    return (
      <div style={styles.reviewsContainer}>
        {this.renderReadyForReviewCheckbox()}
        {this.renderCodeReviewComment()}
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
    justifyContent: 'flex-end'
  },
  right: {
    float: 'right'
  },
  rightFlexContainer: {
    display: 'flex'
  },
  left: {
    float: 'left',
    display: 'flex'
  },
  name: {
    fontWeight: 'bold'
  },
  ellipsisMenu: {
    float: 'right'
  },
  comment: {
    clear: 'both',
    backgroundColor: color.lighter_gray
  },
  timestamp: {
    fontStyle: 'italic',
    float: 'right'
  },
  commentHeaderContainer: {
    margin: '0 0 5px 0'
  }
};
