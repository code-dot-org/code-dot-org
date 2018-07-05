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
    height: '100%',
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
    opacity: PropTypes.number,
  };

  render() {
    const {percentValue, isCorrectAnswer, displayAnswer, opacity} = this.props;

    const rgbaValue = (isCorrectAnswer) ? {backgroundColor: `rgba(14, 190, 14, ${opacity})`} :
    {backgroundColor: `rgba(255, 99, 71, ${opacity})`};

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
      <div style={{...styles.main, ...{...rgbaValue}}}>
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
