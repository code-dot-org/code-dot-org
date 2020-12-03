/**
 * @overview React for the End-of-Stage Experience
 */
import PropTypes from 'prop-types';
import React from 'react';
import color from '../../util/color';
import msg from '@cdo/locale';
import CreateSomething from './lessonExtras/CreateSomething';

const styles = {
  container: {
    margin: 20
  },
  primaryHeader: {
    fontSize: '200%'
  },
  secondaryHeader: {
    color: color.charcoal
  },
  courseblockContainer: {
    width: 720,
    paddingTop: 20
  },
  continueButton: {
    marginTop: 20,
    marginRight: 0
  }
};

export default class PlayZone extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div style={styles.container}>
        <h1 style={styles.primaryHeader}>
          {msg.playzonePrimaryHeader({stageName: this.props.stageName})}
        </h1>
        <h4 style={styles.secondaryHeader}>{msg.playzoneSecondaryHeader()}</h4>
        <CreateSomething />
        <div className="farSide">
          <button
            type="button"
            id="ok-button"
            onClick={this.props.onContinue}
            style={styles.continueButton}
          >
            {msg.playzoneContinueButton()}
          </button>
        </div>
      </div>
    );
  }
}

PlayZone.propTypes = {
  stageName: PropTypes.string.isRequired,
  onContinue: PropTypes.func.isRequired
};
