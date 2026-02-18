/* eslint-disable react/jsx-no-target-blank */
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';

import color from '@cdo/apps/util/color';

import MultiCheckboxSelector from '../../MultiCheckboxSelector';

import ProgressBoxForLessonNumber from './ProgressBoxForLessonNumber';
import {
  getUnpluggedLessonsForScript,
  setSelectedLessons,
} from './sectionStandardsProgressRedux';

class LessonStatusList extends Component {
  static propTypes = {
    dialog: PropTypes.string,
    // redux
    unpluggedLessonList: PropTypes.array,
    setSelectedLessons: PropTypes.func.isRequired,
    selectedLessons: PropTypes.array.isRequired,
    sectionId: PropTypes.number,
    scriptId: PropTypes.number,
  };

  handleChange = (selectedLessons, changedLesson) => {
    this.props.setSelectedLessons(selectedLessons);
  };

  render() {
    // Add the scriptId and sectionId so that we can use them to log metrics
    this.props.unpluggedLessonList.forEach(lesson =>
      Object.assign(lesson, {
        sectionId: this.props.sectionId,
        scriptId: this.props.scriptId,
      })
    );

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

const styles = {
  lessonListItem: {
    display: 'flex',
    flexDirection: 'row',
  },
  links: {
    paddingLeft: 10,
    color: color.teal,
  },
};

const ComplexLessonComponent = function ({lesson}) {
  return (
    <div style={styles.lessonListItem}>
      <div>
        <ProgressBoxForLessonNumber
          completed={lesson.completed}
          inProgress={lesson.inProgress}
          lessonNumber={lesson.number}
          linkToLessonPlan={lesson.url}
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
    inProgress: PropTypes.bool,
  }),
  sectionId: PropTypes.number,
  scriptId: PropTypes.number,
};

export const UnconnectedLessonStatusList = LessonStatusList;

export default connect(
  state => ({
    unpluggedLessonList: getUnpluggedLessonsForScript(state),
    selectedLessons: state.sectionStandardsProgress.selectedLessons,
    sectionId: state.teacherSections.selectedSectionId,
    scriptId: state.unitSelection.scriptId,
  }),
  dispatch => ({
    setSelectedLessons(selected) {
      dispatch(setSelectedLessons(selected));
    },
  })
)(LessonStatusList);
