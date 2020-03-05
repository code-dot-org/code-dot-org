import PropTypes from 'prop-types';
import React, {Component} from 'react';
import MultiCheckboxSelector from '../../MultiCheckboxSelector';
import ProgressBoxForLessonNumber from './ProgressBoxForLessonNumber';
import {connect} from 'react-redux';
import {
  getUnpluggedLessonsForScript,
  setSelectedLessons
} from './sectionStandardsProgressRedux';

const styles = {
  lessonListItem: {
    display: 'flex',
    flexDirection: 'row'
  }
};

class LessonStatusList extends Component {
  static propTypes = {
    // Redux
    unpluggedLessonList: PropTypes.array,
    setSelectedLessons: PropTypes.func.isRequired,
    selectedLessons: PropTypes.array.isRequired,
    scriptId: PropTypes.number,
    getUnpluggedLessonsForScript: PropTypes.func.isRequired
  };

  handleChange = selectedLessons => {
    this.props.setSelectedLessons(selectedLessons);
  };

  componentDidMount() {
    this.props.getUnpluggedLessonsForScript(this.props.scriptId);
  }

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

const ComplexLessonComponent = function({style, lesson}) {
  return (
    <div style={styles.lessonListItem}>
      <div>
        <ProgressBoxForLessonNumber
          completed={lesson.completed}
          lessonNumber={lesson.number}
        />
      </div>
      <a style={{paddingLeft: 10}} href={lesson.url} target={'_blank'}>
        {lesson.name}
      </a>
    </div>
  );
};
ComplexLessonComponent.propTypes = {
  style: PropTypes.object,
  lesson: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    number: PropTypes.number,
    url: PropTypes.string,
    completed: PropTypes.bool
  })
};

export const UnconnectedLessonStatusList = LessonStatusList;

export default connect(
  state => ({
    scriptId: state.scriptSelection.scriptId,
    unpluggedLessonList: state.sectionStandardsProgress.unpluggedLessons,
    selectedLessons: state.sectionStandardsProgress.selectedLessons
  }),
  dispatch => ({
    setSelectedLessons(selected) {
      dispatch(setSelectedLessons(selected));
    },
    getUnpluggedLessonsForScript(scriptId) {
      dispatch(getUnpluggedLessonsForScript(scriptId));
    }
  })
)(LessonStatusList);
