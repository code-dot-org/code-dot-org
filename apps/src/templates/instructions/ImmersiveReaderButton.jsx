import React, {Component} from 'react';
import PropTypes from 'prop-types';
import handleLaunchImmersiveReader from '@cdo/apps/util/immersive_reader';

class ImmersiveReaderButton extends Component {
  static propTypes = {
    title: PropTypes.string,
    text: PropTypes.string
  };

  render() {
    const {title, text} = this.props;

    // We add a classname to this element exclusively so that UI tests can
    // easily detect its presence. This class should NOT be used for
    // styling.
    return (
      <button
        type={'button'}
        onClick={function() {
          handleLaunchImmersiveReader(title, text);
        }}
      >
        {'Immersive Reader'}
      </button>
    );
  }
}

export default ImmersiveReaderButton;
