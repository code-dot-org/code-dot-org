import React from 'react';
import msg from '@cdo/locale';

const LAUNCH_CLASS = 'launch';

export default class SkipButton extends React.Component {
  static propTypes = {
    nextLevelUrl: React.PropTypes.string.isRequired,
  }

  onClick() {
    window.location.href = this.props.nextLevelUrl;
  }

  render() {
    return (
      <button
        id="skipButton"
        className={LAUNCH_CLASS}
        onClick={this.onClick.bind(this)}
      >
        {msg.skipPuzzle()}
      </button>
    );
  }
}
