import React, {Component} from 'react';
import PropTypes from 'prop-types';
import handleLaunchImmersiveReader from '@cdo/apps/util/immersive_reader';
import {renderButtons} from '@microsoft/immersive-reader-sdk';

const styles = {
  immersiveReaderButtonContainer: {
    float: 'right',
    marginTop: '1px',
    height: '16px',
    padding: '8px',
    borderRadius: '4px'
  }
};

class ImmersiveReaderButton extends Component {
  static propTypes = {
    title: PropTypes.string,
    text: PropTypes.string
  };

  componentDidMount() {
    // Applies inline styling to the .immersive-reader-button elements
    renderButtons();
  }

  render() {
    const {title, text} = this.props;

    // We add a classname to this element exclusively so that UI tests can
    // easily detect its presence. This class should NOT be used for
    // styling.
    return (
      <div
        style={styles.immersiveReaderButtonContainer}
        className={'immersive-reader-button'}
        data-button-style={'icon'}
        data-locale={'en'}
        onClick={function() {
          handleLaunchImmersiveReader(title, text);
        }}
      />
    );
  }
}

export default ImmersiveReaderButton;
