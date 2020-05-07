import React from 'react';
import {expect} from '../../../util/deprecatedChai';
import {shallow} from 'enzyme';
import {
  UnconnectedProgressTable as ProgressTable,
  styles
} from '@cdo/apps/templates/progress/ProgressTable';
import SummaryProgressTable from '@cdo/apps/templates/progress/SummaryProgressTable';
import DetailProgressTable from '@cdo/apps/templates/progress/DetailProgressTable';
import LessonGroup from '@cdo/apps/templates/progress/LessonGroup';

const FAKE_LESSONS = [];
const FAKE_LEVELS = [];
const FAKE_LESSON_1 = {
  group: 'jazz',
  lessons: FAKE_LESSONS,
  levels: FAKE_LEVELS
};
const FAKE_LESSON_2 = {
  group: 'samba',
  lessons: FAKE_LESSONS,
  levels: FAKE_LEVELS
};
const DEFAULT_PROPS = {
  isPlc: false,
  isSummaryView: false,
  groupedLessons: [FAKE_LESSON_1]
};

describe('ProgressTable', () => {
  it('renders a single lesson in full view', () => {
    const wrapper = shallow(
      <ProgressTable {...DEFAULT_PROPS} isSummaryView={false} />,
      {disableLifecycleMethods: true}
    );
    expect(wrapper).to.containMatchingElement(
      <div>
        <div style={styles.hidden}>
          <SummaryProgressTable
            lessons={FAKE_LESSONS}
            levelsByLesson={FAKE_LEVELS}
          />
        </div>
        <div style={{}}>
          <DetailProgressTable
            lessons={FAKE_LESSONS}
            levelsByLesson={FAKE_LEVELS}
          />
        </div>
      </div>
    );
  });

  it('renders a single lesson in summary view', () => {
    const wrapper = shallow(
      <ProgressTable {...DEFAULT_PROPS} isSummaryView={true} />,
      {disableLifecycleMethods: true}
    );
    expect(wrapper).to.containMatchingElement(
      <div>
        <div style={{}}>
          <SummaryProgressTable
            lessons={FAKE_LESSONS}
            levelsByLesson={FAKE_LEVELS}
          />
        </div>
        <div style={styles.hidden}>
          <DetailProgressTable
            lessons={FAKE_LESSONS}
            levelsByLesson={FAKE_LEVELS}
          />
        </div>
      </div>
    );
  });

  it('renders multiple lessons as LessonGroups', () => {
    const wrapper = shallow(
      <ProgressTable
        {...DEFAULT_PROPS}
        groupedLessons={[FAKE_LESSON_1, FAKE_LESSON_2]}
      />,
      {disableLifecycleMethods: true}
    );
    expect(wrapper).to.containMatchingElement(
      <div>
        <LessonGroup
          key={FAKE_LESSON_1.group}
          isPlc={DEFAULT_PROPS.isPlc}
          groupName={FAKE_LESSON_1.group}
          isSummaryView={DEFAULT_PROPS.isSummaryView}
          lessons={FAKE_LESSON_1.lessons}
          levelsByLesson={FAKE_LESSON_1.levels}
        />
        <LessonGroup
          key={FAKE_LESSON_2.group}
          isPlc={DEFAULT_PROPS.isPlc}
          groupName={FAKE_LESSON_2.group}
          isSummaryView={DEFAULT_PROPS.isSummaryView}
          lessons={FAKE_LESSON_2.lessons}
          levelsByLesson={FAKE_LESSON_2.levels}
        />
      </div>
    );
  });
});
