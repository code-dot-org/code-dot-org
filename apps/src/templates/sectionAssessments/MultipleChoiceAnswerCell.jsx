import React, {Component, PropTypes} from 'react';
import color from "@cdo/apps/util/color";
import FontAwesome from '@cdo/apps/templates/FontAwesome';

const styles = {
  main: {
    border: 'none',
    marginTop: 20,
    marginRight: 80,
    paddingTop: 20,
    paddingLeft: 20,
    paddingRight: 10,
    paddingBottom: 10,
  },
  icon: {
    color: color.level_perfect,
    float: 'left',
    width: 20,
  },
  text: {
    color: color.charcoal,
    fontFamily: '"Gotham 5r", sans-serif',
    fontSize: 16,
    float: 'left',
    paddingRight: 40,
    width: 20,
    textAlign: 'center',
  },
};

class MultipleChoiceAnswerCell extends Component {
  static propTypes = {
    percentValue: PropTypes.number.isRequired,
    isCorrectAnswer: PropTypes.bool,
  };

  render() {
    const {percentValue, isCorrectAnswer} = this.props;
    return (
      <div>
        <div>
          {(percentValue >= 0) &&
            <span>{`${percentValue}%`}</span>
          }
          {(percentValue === undefined) &&
            <span>{'-'}</span>
          }
        </div>
        <div>
          {isCorrectAnswer &&
             <FontAwesome icon="check-circle" style={styles.icon}/>
          }
        </div>
      </div>
    );
  }
}

export default MultipleChoiceAnswerCell;
