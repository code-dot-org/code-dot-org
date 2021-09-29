/**
 * @overview React for the End-of-Lesson Experience
 */
import PropTypes from 'prop-types';
import React from 'react';
import color from '../../util/color';
import i18n from '@cdo/locale';
import CreateSomething from './lessonExtras/CreateSomething';

export default class PlayZone extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div style={styles.container}>
        <h1 style={styles.primaryHeader}>
          {i18n.playzonePrimaryHeader({stageName: this.props.lessonName})}
        </h1>
        <h4 style={styles.secondaryHeader}>{i18n.playzoneSecondaryHeader()}</h4>
        <CreateSomething />
        <div className="farSide">
          <button
            type="button"
            id="ok-button"
            onClick={this.props.onContinue}
            style={styles.continueButton}
          >
            {i18n.playzoneContinueButton()}
          </button>
        </div>
      </div>
    );
  }
}

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

PlayZone.propTypes = {
  lessonName: PropTypes.string.isRequired,
  onContinue: PropTypes.func.isRequired
};
