import PropTypes from 'prop-types';
import React, {Component} from 'react';
import ProgressBox from '../ProgressBox';

const styles = {
  lessonBox: {
    marginRight: 5,
    marginLeft: 5
  }
};

export default class ProgressBoxForLessonNumber extends Component {
  static propTypes = {
    completed: PropTypes.bool,
    lessonNumber: PropTypes.number,
    tooltipId: PropTypes.string,
    linkToLessonPlan: PropTypes.string
  };

  render() {
    const {completed, lessonNumber, tooltipId, linkToLessonPlan} = this.props;

    return (
      <a href={linkToLessonPlan} target="_blank" data-for={tooltipId} data-tip>
        <ProgressBox
          style={styles.lessonBox}
          started={completed}
          incomplete={completed ? 0 : 20}
          imperfect={0}
          perfect={completed ? 20 : 0}
          lessonNumber={lessonNumber}
        />
      </a>
    );
  }
}
