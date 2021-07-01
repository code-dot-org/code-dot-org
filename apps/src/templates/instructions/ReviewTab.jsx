import React, {Component} from 'react';
import javalabMsg from '@cdo/javalab/locale';

export default class ReviewTab extends Component {
  state = {
    readyForReview: false
  };

  renderReadyForReviewCheckbox() {
    const readyForReview = this.state.readyForReview;

    return (
      <label style={styles.label}>
        <input
          type="checkbox"
          checked={readyForReview}
          onChange={() => this.setState({readyForReview: !readyForReview})}
          style={styles.checkbox}
        />
        {javalabMsg.enablePeerReview()}
      </label>
    );
  }

  render() {
    return (
      <div style={styles.container}>{this.renderReadyForReviewCheckbox()}</div>
    );
  }
}

const styles = {
  container: {
    margin: '10px 5%'
  },
  label: {
    float: 'right',
    margin: 0
  },
  checkbox: {margin: '0 7px 0 0'}
};
