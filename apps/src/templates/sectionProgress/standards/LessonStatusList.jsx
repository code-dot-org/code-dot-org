import PropTypes from 'prop-types';
import React, {Component} from 'react';
import MultiCheckboxSelector from '../../MultiCheckboxSelector';
import ProgressBoxForLessonNumber from './ProgressBoxForLessonNumber';
import {connect} from 'react-redux';
import {
  getUnpluggedLessonsForScript,
  setSelectedLessons
} from './sectionStandardsProgressRedux';
import color from '@cdo/apps/util/color';

const styles = {
  lessonListItem: {
    display: 'flex',
    flexDirection: 'row'
  },
  links: {
    paddingLeft: 10,
    color: color.teal
  }
};

class LessonStatusList extends Component {
  static propTypes = {
    unpluggedLessonList: PropTypes.array,
    setSelectedLessons: PropTypes.func.isRequired,
    selectedLessons: PropTypes.array.isRequired
  };

  handleChange = selectedLessons => {
    this.props.setSelectedLessons(selectedLessons);
  };

  render() {
    return (
      <MultiCheckboxSelector
        noHeader={true}
        items={this.props.unpluggedLessonList}
        itemPropName="lesson"
        selected={this.props.selectedLessons}
        checkById={true}
        onChange={this.handleChange}
      >
        <ComplexLessonComponent />
      </MultiCheckboxSelector>
    );
  }
}

const ComplexLessonComponent = function({lesson}) {
  return (
    <div style={styles.lessonListItem}>
      <div>
        <ProgressBoxForLessonNumber
          completed={lesson.completed}
          inProgress={lesson.inProgress}
          lessonNumber={lesson.number}
        />
      </div>
      <a style={styles.links} href={lesson.url} target={'_blank'}>
        {lesson.name}
      </a>
    </div>
  );
};
ComplexLessonComponent.propTypes = {
  lesson: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    number: PropTypes.number,
    url: PropTypes.string,
    completed: PropTypes.bool,
    inProgress: PropTypes.bool
  })
};

export const UnconnectedLessonStatusList = LessonStatusList;

export default connect(
  state => ({
    unpluggedLessonList: getUnpluggedLessonsForScript(state),
    selectedLessons: state.sectionStandardsProgress.selectedLessons
  }),
  dispatch => ({
    setSelectedLessons(selected) {
      dispatch(setSelectedLessons(selected));
    }
  })
)(LessonStatusList);
