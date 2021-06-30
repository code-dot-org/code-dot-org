import React, {Component} from 'react';
import javalabMsg from '@cdo/javalab/locale';

/**
 * This is a placeholder for the upcoming "Review" tab in Javalab.
 * See related task: https://codedotorg.atlassian.net/browse/CSA-361
 */

export default class ReviewTab extends Component {
  state = {
    readyForReview: false
  };

  renderReadyForReviewCheckbox() {
    const readyForReview = this.state.readyForReview;

    return (
      <label style={styles.label}>
        {javalabMsg.enablePeerReview()}
        <input
          type="checkbox"
          checked={readyForReview}
          onChange={() => this.setState({readyForReview: !readyForReview})}
          style={styles.checkbox}
        />
      </label>
    );
  }

  render() {
    return this.renderReadyForReviewCheckbox();
  }
}

const styles = {
  label: {
    float: 'right',
    margin: 0
  },
  checkbox: {margin: '0 0 0 7px'}
};
