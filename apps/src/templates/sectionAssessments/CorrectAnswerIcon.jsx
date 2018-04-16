import React, {Component, PropTypes} from 'react';
import color from "@cdo/apps/util/color";
import FontAwesome from '@cdo/apps/templates/FontAwesome';

const styles = {
  main: {
    border: 'none',
    height: 30,
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
    fontSize: 25,
  },
  text: {
    color: color.charcoal,
    fontFamily: '"Gotham 3r", sans-serif',
    fontSize: 16,
    float: 'left',
    paddingRight: 40,
    width: 20,
  },
};

class CorrectAnswerIcon extends Component {
  static propTypes = {
    percentValue: PropTypes.string.isRequired,
    isCorrectAnswer: PropTypes.bool.isRequired,
  };

  render() {
    const {percentValue} = this.props;
    return (
      <div style={styles.main}>
        <div style={styles.text}>
          {percentValue}
        </div>
        <div>
          <FontAwesome icon="check-circle" style={styles.icon}/>
        </div>
      </div>
    );
  }
}

export default CorrectAnswerIcon;
