import React, {Component, PropTypes} from 'react';
import color from "@cdo/apps/util/color";
import FontAwesome from '@cdo/apps/templates/FontAwesome';

const styles = {
  main: {
    border: 'none',
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    color: color.level_perfect,
  },
  text: {
    color: color.charcoal,
    fontFamily: '"Gotham 5r", sans-serif',
    marginRight: 10,
  },
};

class MultipleChoiceAnswerCell extends Component {
  static propTypes = {
    percentValue: PropTypes.number.isRequired,
    isCorrectAnswer: PropTypes.bool,
    displayAnswer: PropTypes.string,
  };

  render() {
    const {percentValue, isCorrectAnswer, displayAnswer} = this.props;
    if (displayAnswer) {
      return (
        <div style={styles.main}>
          <div style={styles.text}>
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
      <div style={styles.main}>
        <div style={styles.text}>
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
