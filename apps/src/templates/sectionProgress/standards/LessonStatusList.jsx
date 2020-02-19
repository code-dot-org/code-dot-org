import PropTypes from 'prop-types';
import React, {Component} from 'react';
import MultiCheckboxSelector from '../../MultiCheckboxSelector';
import ProgressBoxForLessonNumber from './ProgressBoxForLessonNumber';
import {connect} from 'react-redux';
import {getUnpluggedLessonsForScript} from './sectionStandardsProgressRedux';

const styles = {
  lessonListItem: {
    display: 'flex',
    flexDirection: 'row'
  }
};

class LessonStatusList extends Component {
  static propTypes = {
    unpluggedLessonList: PropTypes.array
  };

  render() {
    return (
      <MultiCheckboxSelector
        noHeader={true}
        items={this.props.unpluggedLessonList}
        itemPropName="lesson"
        selected={[]}
        onChange={() => {}}
      >
        <ComplexLessonComponent />
      </MultiCheckboxSelector>
    );
  }
}

const ComplexLessonComponent = function({style, lesson}) {
  return (
    <a href={lesson.url} target={'_blank'} style={styles.lessonListItem}>
      <div>
        <ProgressBoxForLessonNumber
          completed={false}
          lessonNumber={lesson.number}
        />
      </div>
      <span style={{paddingLeft: 10}}>{lesson.name}</span>
    </a>
  );
};
ComplexLessonComponent.propTypes = {
  style: PropTypes.object,
  lesson: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    number: PropTypes.number,
    url: PropTypes.string
  })
};

export const UnconnectedLessonStatusList = LessonStatusList;

export default connect(state => ({
  unpluggedLessonList: getUnpluggedLessonsForScript(state)
}))(LessonStatusList);
