import PropTypes from 'prop-types';
import React, {Component} from 'react';
import ProgressBox from '../ProgressBox';

const styles = {
  lessonBox: {
    marginRight: 10
  }
};

export default class ProgressBoxForLessonNumber extends Component {
  static propTypes = {
    completed: PropTypes.bool,
    lessonNumber: PropTypes.number
  };

  render() {
    const {completed, lessonNumber} = this.props;

    return (
      <ProgressBox
        style={styles.lessonBox}
        started={completed}
        incomplete={completed ? 0 : 20}
        imperfect={0}
        perfect={completed ? 20 : 0}
        showLessonNumber
        lessonNumber={lessonNumber}
      />
    );
  }
}
