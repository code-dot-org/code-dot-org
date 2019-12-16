import PropTypes from 'prop-types';
import React, {Component} from 'react';
import MultiCheckboxSelector from '../../MultiCheckboxSelector';
import ProgressBox from '../ProgressBox';

const styles = {
  lessonListItem: {
    display: 'flex',
    flexDirection: 'row'
  }
};

export class LessonStatusList extends Component {
  static propTypes = {};

  render() {
    return (
      <MultiCheckboxSelector
        noHeader={true}
        items={[
          {
            id: 'one',
            name: 'Lesson 1',
            number: 1,
            url: 'https://curriculum.code.org/csf-19/coursea/1/'
          },
          {
            id: 'two',
            name: 'Lesson 4',
            number: 3,
            url: 'https://curriculum.code.org/csf-19/coursea/3/'
          }
        ]}
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
    <div style={styles.lessonListItem}>
      <div>
        <ProgressBox
          started={false}
          incomplete={0}
          imperfect={0}
          perfect={0}
          showLessonNumber={true}
          lessonNumber={lesson.number}
        />
      </div>
      <a style={{paddingLeft: 10}} href={lesson.url}>
        {lesson.name}
      </a>
    </div>
  );
};
ComplexLessonComponent.propTypes = {
  style: PropTypes.object,
  lesson: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    number: PropTypes.number,
    url: PropTypes.string
  })
};

export const UnconnectedLessonStatusList = LessonStatusList;
