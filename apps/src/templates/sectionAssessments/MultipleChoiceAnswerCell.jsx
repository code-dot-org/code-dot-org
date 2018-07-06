import React, {Component, PropTypes} from 'react';
import color from "@cdo/apps/util/color";
import FontAwesome from '@cdo/apps/templates/FontAwesome';

const styles = {
  main: {
    border: 'none',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
  },
  icon: {
    color: color.level_perfect,
    paddingRight: 5,
    fontSize: 20,
  },
  value: {
    color: color.charcoal,
    fontFamily: '"Gotham 5r", sans-serif',
    marginRight: 15,
    marginLeft: 10,
  },
};

function  calculateOpacity(answered) {
 return ((answered + 10) * (9 / 10))/100;
}

class MultipleChoiceAnswerCell extends Component {
  static propTypes = {
    percentValue: PropTypes.number.isRequired,
    isCorrectAnswer: PropTypes.bool,
    displayAnswer: PropTypes.string,
  };

  render() {
    const {percentValue, isCorrectAnswer, displayAnswer} = this.props;

    const opacity = calculateOpacity(percentValue);

    const backgroundCSS = (isCorrectAnswer) ? {backgroundColor: `rgba(159, 212, 159, ${opacity})`} :
      {backgroundColor: `rgba(255, 99, 71, ${opacity})`};

    if (displayAnswer) {
      return (
        <div style={styles.main}>
          <div style={styles.value}>
            {displayAnswer}
          </div>
          <div style={styles.icon}>
          {isCorrectAnswer &&
            <FontAwesome icon="check-circle" style={styles.icon}/>
          }
          </div>
        </div>
      );
    }

    return (
      <div style={{...styles.main, ...{...backgroundCSS}}}>
        <div style={styles.value}>
          {(percentValue >= 0) &&
            <span>{`${percentValue}%`}</span>
          }
          {(percentValue < 0 ) &&
            <span>{'-'}</span>
          }
        </div>
        <div style={styles.icon}>
          {isCorrectAnswer &&
            <FontAwesome icon="check-circle" style={styles.icon}/>
          }
        </div>
      </div>
    );
  }
}

MultipleChoiceAnswerCell.defaultProps = {
  percentValue: -1
};

export default MultipleChoiceAnswerCell;
