import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import SelectedStudentInfo from '@cdo/apps/code-studio/components/progress/teacherPanel/SelectedStudentInfo';
import {LevelStatus} from '@cdo/generated-scripts/sharedConstants';
import i18n from '@cdo/locale';

const LEVEL_WITH_PROGRESS = {
  id: '123',
  assessment: null,
  contained: false,
  paired: false,
  partnerNames: null,
  partnerCount: null,
  isConceptLevel: false,
  levelNumber: 4,
  passed: false,
  status: LevelStatus.not_tried,
};

const DEFAULT_SELECTED_USER = 1;

const DEFAULT_PROPS = {
  students: [
    {id: 1, name: 'Student 1'},
    {id: 2, name: 'Student 2'},
  ],
  levelsWithProgress: [
    {...LEVEL_WITH_PROGRESS, userId: 1},
    {...LEVEL_WITH_PROGRESS, userId: 2},
    {...LEVEL_WITH_PROGRESS, userId: 5},
  ],
  onSelectUser: () => {},
  selectedUserId: DEFAULT_SELECTED_USER,
  teacherId: 5,
};

const setUp = overrideProps => {
  const props = {...DEFAULT_PROPS, ...overrideProps};
  return shallow(<SelectedStudentInfo {...props} />);
};

describe('SelectedStudentInfo', () => {
  it('displays name and bubble no matter level type', () => {
    const wrapper = setUp();
    expect(wrapper.contains('Student 1')).toBe(true);
    expect(wrapper.find('ProgressBubble')).toHaveLength(1);
  });

  // levelWithProgress data is loaded async, this test ensures the component handles missing data
  it('displays student name, gracefully handles missing userLevel', () => {
    const wrapper = setUp({levelsWithProgress: null});
    expect(wrapper.contains('Student 1')).toBe(true);
    expect(wrapper.find('ProgressBubble')).toHaveLength(0);
  });

  it('displays teacher if selectedUserId is null, gracefully handles missing userLevel', () => {
    const wrapper = setUp({levelsWithProgress: null, selectedUserId: null});
    expect(wrapper.contains(i18n.studentTableTeacherDemo())).toBe(true);
    expect(wrapper.find('ProgressBubble')).toHaveLength(0);
  });

  it('passes expected levelWithProgress to ProgressBubble for selected user', () => {
    const teacherLevelWithProgress = {
      ...LEVEL_WITH_PROGRESS,
      userId: 5,
      id: 'test',
    };
    const wrapper = setUp({
      levelsWithProgress: [teacherLevelWithProgress],
      selectedUserId: null,
    });
    const progressBubble = wrapper.find('ProgressBubble');
    expect(progressBubble).toHaveLength(1);
    expect(progressBubble.props().level.id).toBe('test');
  });

  it('displays time and unsubmit button if submitted level', () => {
    const levelWithProgress = {
      ...LEVEL_WITH_PROGRESS,
      submitLevel: true,
      submitted: true,
      status: LevelStatus.submitted,
      userId: DEFAULT_SELECTED_USER,
    };
    const wrapper = setUp({levelsWithProgress: [levelWithProgress]});
    expect(wrapper.contains('Submitted On:')).toBe(true);
    expect(wrapper.find('Button')).toHaveLength(1);
  });

  it('displays time and clear response button if contained level', () => {
    const levelWithProgress = {
      ...LEVEL_WITH_PROGRESS,
      contained: true,
      status: LevelStatus.perfect,
      userId: DEFAULT_SELECTED_USER,
    };
    const wrapper = setUp({levelsWithProgress: [levelWithProgress]});

    expect(wrapper.contains('Last Updated:')).toBe(true);
  });

  it('displays time if paired', () => {
    const levelWithProgress = {
      ...LEVEL_WITH_PROGRESS,
      status: LevelStatus.perfect,
      paired: true,
      userId: DEFAULT_SELECTED_USER,
    };

    const wrapper = setUp({
      levelsWithProgress: [levelWithProgress],
    });

    expect(wrapper.contains('Last Updated:')).toBe(true);
  });

  it('does not display SelectedStudentPairing if not paired', () => {
    const wrapper = setUp();
    expect(wrapper.find('SelectedStudentPairing')).toHaveLength(0);
  });

  it('displays SelectedStudentPairing if paired', () => {
    const levelWithProgress = {
      ...LEVEL_WITH_PROGRESS,
      status: LevelStatus.perfect,
      paired: true,
      userId: DEFAULT_SELECTED_USER,
    };
    const wrapper = setUp({levelsWithProgress: [levelWithProgress]});
    expect(wrapper.find('SelectedStudentPairing')).toHaveLength(1);
  });
});
