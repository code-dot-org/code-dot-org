import PropTypes from 'prop-types';
import React, {Component} from 'react';
import color from '@cdo/apps/util/color';
import FontAwesome from '@cdo/apps/templates/FontAwesome';

function calculateOpacity(answered) {
  return (answered + 10) / 100;
}

class PercentAnsweredCell extends Component {
  static propTypes = {
    percentValue: PropTypes.number.isRequired,
    isCorrectAnswer: PropTypes.bool,
    displayAnswer: PropTypes.string,
    isSurvey: PropTypes.bool,
    mainLayoutStyle: PropTypes.object,
    valueLayoutStyle: PropTypes.object
  };

  getBackgroundColor = percentValue => {
    const {isCorrectAnswer, isSurvey} = this.props;
    const opacity = calculateOpacity(percentValue);
    return isCorrectAnswer || isSurvey
      ? `rgba(159, 212, 159, ${opacity})`
      : `rgba(255, 99, 71, ${opacity})`;
  };

  render() {
    const {percentValue, isCorrectAnswer, displayAnswer} = this.props;

    // Display a cell with letters for answers.
    if (displayAnswer) {
      return (
        <div style={styles.main}>
          <div style={styles.value}>{displayAnswer}</div>
          <div style={styles.icon}>
            {isCorrectAnswer && (
              <FontAwesome icon="check-circle" style={styles.icon} />
            )}
          </div>
        </div>
      );
    }

    // Display a cell showing the percent answered.
    const backgroundCSS = {
      backgroundColor: this.getBackgroundColor(percentValue)
    };
    return (
      <div style={{...this.props.mainLayoutStyle, ...backgroundCSS}}>
        <div style={{...styles.value, ...this.props.valueLayoutStyle}}>
          {percentValue >= 0 && <span>{`${percentValue}%`}</span>}
          {percentValue < 0 && <span>{'-'}</span>}
        </div>
        <div style={styles.icon}>
          {isCorrectAnswer && (
            <FontAwesome icon="check-circle" style={styles.icon} />
          )}
        </div>
      </div>
    );
  }
}

const styles = {
  main: {
    border: 'none',
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
    padding: 10
  },
  icon: {
    color: color.level_perfect
  },
  value: {
    color: color.charcoal,
    fontFamily: '"Gotham 5r", sans-serif'
  }
};

PercentAnsweredCell.defaultProps = {
  percentValue: -1,
  mainLayoutStyle: styles.main,
  valueLayoutStyle: {marginRight: 10}
};

export default PercentAnsweredCell;
