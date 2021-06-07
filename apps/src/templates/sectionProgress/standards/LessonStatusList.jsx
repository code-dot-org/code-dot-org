import PropTypes from 'prop-types';
import React, {Component} from 'react';
import MultiCheckboxSelector from '../../MultiCheckboxSelector';
import ProgressBoxForLessonNumber from './ProgressBoxForLessonNumber';
import {connect} from 'react-redux';
import {
  getUnpluggedLessonsForScript,
  setSelectedLessons
} from './sectionStandardsProgressRedux';
import firehoseClient from '../../../lib/util/firehose';
import color from '@cdo/apps/util/color';

class LessonStatusList extends Component {
  static propTypes = {
    dialog: PropTypes.string,
    // redux
    unpluggedLessonList: PropTypes.array,
    setSelectedLessons: PropTypes.func.isRequired,
    selectedLessons: PropTypes.array.isRequired,
    sectionId: PropTypes.number,
    scriptId: PropTypes.number
  };

  handleChange = (selectedLessons, changedLesson) => {
    firehoseClient.putRecord(
      {
        study: 'teacher_dashboard_actions',
        study_group: 'standards',
        event: 'update_unplugged_lesson_list',
        data_json: JSON.stringify({
          section_id: this.props.sectionId,
          script_id: this.props.scriptId,
          changed_lesson_id: changedLesson.id,
          lesson_selected: !changedLesson.completed,
          dialog: this.props.dialog
        })
      },
      {includeUserId: true}
    );
    this.props.setSelectedLessons(selectedLessons);
  };

  render() {
    // Add the scriptId and sectionId so that we can use them to log metrics
    this.props.unpluggedLessonList.forEach(lesson =>
      Object.assign(lesson, {
        sectionId: this.props.sectionId,
        scriptId: this.props.scriptId
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
    flexDirection: 'row'
  },
  links: {
    paddingLeft: 10,
    color: color.teal
  }
};

const handleLessonLinkClick = function(lesson) {
  firehoseClient.putRecord(
    {
      study: 'teacher_dashboard_actions',
      study_group: 'standards',
      event: 'click_unplugged_lesson_link',
      data_json: JSON.stringify({
        link: lesson.url,
        section_id: lesson.sectionId,
        script_id: lesson.scriptId
      })
    },
    {includeUserId: true}
  );
};

const ComplexLessonComponent = function({lesson}) {
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
      <a
        style={styles.links}
        href={lesson.url}
        target={'_blank'}
        onClick={() => handleLessonLinkClick(lesson)}
      >
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
  }),
  sectionId: PropTypes.number,
  scriptId: PropTypes.number
};

export const UnconnectedLessonStatusList = LessonStatusList;

export default connect(
  state => ({
    unpluggedLessonList: getUnpluggedLessonsForScript(state),
    selectedLessons: state.sectionStandardsProgress.selectedLessons,
    sectionId: state.sectionData.section.id,
    scriptId: state.scriptSelection.scriptId
  }),
  dispatch => ({
    setSelectedLessons(selected) {
      dispatch(setSelectedLessons(selected));
    }
  })
)(LessonStatusList);
