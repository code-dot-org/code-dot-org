import React, {PropTypes} from 'react';
import msg from '@cdo/locale';

const LAUNCH_CLASS = 'launch';

export default class SkipButton extends React.Component {
  static propTypes = {
    nextLevelUrl: PropTypes.string.isRequired,
  };

  render() {
    return (
      <button
        id="skipButton"
        className={LAUNCH_CLASS}
      >
        {msg.skipPuzzle()}
      </button>
    );
  }
}
