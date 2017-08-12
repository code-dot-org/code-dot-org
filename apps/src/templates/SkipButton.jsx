import React from 'react';
import msg from '@cdo/locale';
import { connect } from 'react-redux';

const LAUNCH_CLASS = 'launch';

class SkipButton extends React.Component {
  static propTypes = {
    nextLevelUrl: React.PropTypes.string.isRequired,
    showSkipButton: React.PropTypes.bool.isRequired,
  }

  onClick() {
    window.location.href = this.props.nextLevelUrl;
  }

  render() {
    if (!this.props.showSkipButton) {
      return null;
    }
    return (
      <button id="skipButton" className={LAUNCH_CLASS} onClick={this.onClick.bind(this)}>
        {msg.skipPuzzle()}
      </button>
    );
  }
}

export default connect(state => ({
  showSkipButton: state.pageConstants.isChallengeLevel,
  nextLevelUrl: state.pageConstants.nextLevelUrl,
}))(SkipButton);
