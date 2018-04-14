import React, {Component, PropTypes} from 'react';
import color from "@cdo/apps/util/color";
import FontAwesome from '@cdo/apps/templates/FontAwesome';

const styles = {
  main: {
    border: 'none',
    height: '30px',
    marginTop: '20px',
    marginRight: '80px',
    paddingTop: '20px',
    paddingLeft: '20px',
    paddingRight: '10px',
    paddingBottom: '10px',
  },
  icon: {
    color: color.level_perfect,
    float: 'left',
    width: '10%',
    fontSize: '25px',
  },
  text: {
    color: color.charcoal,
    fontFamily: '"Gotham 3r", sans-serif',
    fontSize: '16px',
    float: 'left',
    paddingRight: '40px',
    width: '10%',
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
