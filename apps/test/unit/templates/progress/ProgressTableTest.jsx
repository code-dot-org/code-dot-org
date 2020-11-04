import React from 'react';
import {expect} from '../../../util/reconfiguredChai';
import {shallow} from 'enzyme';
import {UnconnectedProgressTable as ProgressTable} from '@cdo/apps/templates/progress/ProgressTable';

const FAKE_LESSONS = [];

const FAKE_LESSON_1 = {
  displayName: 'jazz',
  lessons: FAKE_LESSONS
};
const FAKE_LESSON_2 = {
  displayName: 'samba',
  lessons: FAKE_LESSONS
};
const DEFAULT_PROPS = {
  isPlc: false,
  isSummaryView: false,
  lessonGroups: [FAKE_LESSON_1]
};

describe('ProgressTable', () => {
  it('renders a single lesson in full view', () => {
    const wrapper = shallow(
      <ProgressTable {...DEFAULT_PROPS} isSummaryView={false} />,
      {disableLifecycleMethods: true}
    );
    const summaryTable = wrapper.find('Connect(SummaryProgressTable)');
    expect(summaryTable.props().lessons).to.equal(FAKE_LESSONS);
    const detailTable = wrapper.find('DetailProgressTable');
    expect(detailTable.props().lessons).to.equal(FAKE_LESSONS);
  });

  it('renders a single lesson in summary view', () => {
    const wrapper = shallow(
      <ProgressTable {...DEFAULT_PROPS} isSummaryView={true} />,
      {disableLifecycleMethods: true}
    );
    const summaryTable = wrapper.find('Connect(SummaryProgressTable)');
    expect(summaryTable.props().lessons).to.equal(FAKE_LESSONS);
    const detailTable = wrapper.find('DetailProgressTable');
    expect(detailTable.props().lessons).to.equal(FAKE_LESSONS);
  });

  it('renders multiple lessons as LessonGroups', () => {
    const wrapper = shallow(
      <ProgressTable
        {...DEFAULT_PROPS}
        lessonGroups={[FAKE_LESSON_1, FAKE_LESSON_2]}
      />,
      {disableLifecycleMethods: true}
    );
    const firstLessonGroup = wrapper.find('Connect(LessonGroup)').first();
    expect(firstLessonGroup.props().lessonGroup.displayName).to.equal(
      FAKE_LESSON_1.displayName
    );
    expect(firstLessonGroup.props().isPlc).to.equal(DEFAULT_PROPS.isPlc);
    expect(firstLessonGroup.props().lessonGroup).to.equal(FAKE_LESSON_1);
    expect(firstLessonGroup.props().isSummaryView).to.equal(
      DEFAULT_PROPS.isSummaryView
    );
    const lastLessonGroup = wrapper.find('Connect(LessonGroup)').last();
    expect(lastLessonGroup.props().lessonGroup.displayName).to.equal(
      FAKE_LESSON_2.displayName
    );
    expect(lastLessonGroup.props().isPlc).to.equal(DEFAULT_PROPS.isPlc);
    expect(lastLessonGroup.props().lessonGroup).to.equal(FAKE_LESSON_2);
    expect(lastLessonGroup.props().isSummaryView).to.equal(
      DEFAULT_PROPS.isSummaryView
    );
  });
});
