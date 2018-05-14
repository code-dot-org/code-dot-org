import React, {Component, PropTypes} from 'react';
import color from "@cdo/apps/util/color";
import FontAwesome from '@cdo/apps/templates/FontAwesome';

const PADDING = 80;

const styles = {
  main: {
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'row',
    minWidth: '80%',
    alignItems: 'center',
  },

  icon: {
    color: color.level_perfect,
    // float: 'left',
    // display: 'flex',
    // justifyContent: 'flex-end',

    // width: 80,
    // clear: 'left',
    // width: '40%',
  },

  text: {
    color: color.charcoal,
    // fontFamily: '"Gotham 5r", sans-serif',
    // // fontSize: 16,
    // float: 'left',
    // // clear: 'right',
    marginRight: 10,
    // // width: '60%',
    // textAlign: 'center',
    // minWidth: '60',
    // display: 'flex',
    // flexDirection: 'row',
    // flexWrap: 'wrap',
    // justifyContent: 'space-between',
    // width: styleConstants['content-width'],
    // display: 'flex',
    // flexDirection: 'row',
    // flexWrap: 'wrap',
    // justifyContent: 'space-between',
    // minWidth: '60%',
  },

  header: {
    width: 70,
    textAlign: 'center',
  }
  
};

class MultipleChoiceAnswerCell extends Component {
  static propTypes = {
    percentValue: PropTypes.number.isRequired,
    isCorrectAnswer: PropTypes.bool,
  };

  render() {
    const {percentValue, isCorrectAnswer} = this.props
      console.log('percentValue -->', percentValue);
    return (
      <div style={styles.main}>
        <div style={styles.text}>
          {(percentValue >= 0) && <span>{`${percentValue}%`}</span>
          }
          {(percentValue < 0 ) &&
            <span>{'-'}</span>
          }
        </div>
        <div style={styles.icon}>
          {isCorrectAnswer &&
             <FontAwesome icon="check-circle" />
          }
        </div>
      </div>
    );
  }
}

MultipleChoiceAnswerCell.defaultProps = {
  percentValue: -1
};


export const TableHeader = ({ answerOptions }) => (
    <div style={styles.header}>
      {answerOptions}
    </div>
)

TableHeader.propTypes = {
  answerOptions: PropTypes.string.isRequired,
}

export default MultipleChoiceAnswerCell;
