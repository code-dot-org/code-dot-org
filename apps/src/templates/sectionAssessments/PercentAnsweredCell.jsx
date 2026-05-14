import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

import moduleStyles from './percent-answered-cell.module.scss';

function calculateOpacity(answered) {
  return (answered + 10) / 100;
}

const defaultMainLayoutStyle = {
  border: 'none',
  display: 'flex',
  justifyContent: 'space-between',
  flexDirection: 'row',
  alignItems: 'center',
  boxSizing: 'border-box',
  height: '100%',
  padding: 10,
};

class PercentAnsweredCell extends Component {
  static propTypes = {
    percentValue: PropTypes.number.isRequired,
    isCorrectAnswer: PropTypes.bool,
    displayAnswer: PropTypes.string,
    isSurvey: PropTypes.bool,
    mainLayoutStyle: PropTypes.object,
    valueLayoutStyle: PropTypes.object,
  };

  getBackgroundColor = percentValue => {
    const {isCorrectAnswer, isSurvey} = this.props;
    const opacity = calculateOpacity(percentValue);
    return isCorrectAnswer || isSurvey
      ? `rgba(159, 212, 159, ${opacity})`
      : `rgba(255, 99, 71, ${opacity})`;
  };

  renderCorrectIcon() {
    if (!this.props.isCorrectAnswer) return null;
    return (
      <FontAwesomeV6Icon
        iconName="check-circle"
        className={moduleStyles.correctIcon}
      />
    );
  }

  render() {
    const {percentValue, displayAnswer} = this.props;

    // Display a cell with letters for answers.
    if (displayAnswer) {
      return (
        <div style={defaultMainLayoutStyle}>
          <div className={moduleStyles.value}>{displayAnswer}</div>
          {this.renderCorrectIcon()}
        </div>
      );
    }

    // Display a cell showing the percent answered.
    const backgroundCSS = {
      backgroundColor: this.getBackgroundColor(percentValue),
    };
    return (
      <div style={{...this.props.mainLayoutStyle, ...backgroundCSS}}>
        <div className={moduleStyles.value} style={this.props.valueLayoutStyle}>
          {percentValue >= 0 && <span>{`${percentValue}%`}</span>}
          {percentValue < 0 && <span>{'-'}</span>}
        </div>
        {this.renderCorrectIcon()}
      </div>
    );
  }
}

PercentAnsweredCell.defaultProps = {
  percentValue: -1,
  mainLayoutStyle: defaultMainLayoutStyle,
  valueLayoutStyle: {marginRight: 10},
};

export default PercentAnsweredCell;
