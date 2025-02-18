import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports

import {
  fakeLessonWithLevels,
  fakeStudents,
  fakeStudentLevelProgress,
} from '@cdo/apps/templates/progress/progressTestHelpers';
import {
  getSummaryCellFormatters,
  getDetailCellFormatters,
  unitTestExports,
} from '@cdo/apps/templates/sectionProgress/progressTables/progressTableHelpers';

describe('progressTableHelpers', () => {
  describe('formatTimeSpent', () => {
    const formatTimeSpent = unitTestExports.formatTimeSpent;

    it('returns "" when progress is null', () => {
      expect(formatTimeSpent(null)).toBe('');
    });

    it('returns "-" when timeSpent is 0', () => {
      const studentProgress = {timeSpent: 0};
      expect(formatTimeSpent(studentProgress)).toBe('-');
    });

    it('returns timeSpent in minutes', () => {
      // 140 seconds rounds up to 3 minutes
      const studentProgress = {timeSpent: 140};
      expect(formatTimeSpent(studentProgress)).toBe('3');
    });
  });

  describe('formatLastUpdated', () => {
    const formatLastUpdated = unitTestExports.formatLastUpdated;
    it('returns "-" when progress is null', () => {
      expect(formatLastUpdated(null)).toBe('');
    });

    it('returns "-" when lastTimestamp is 0', () => {
      const studentProgress = {lastTimestamp: 0};
      expect(formatLastUpdated(studentProgress)).toBe('-');
    });

    it('returns timestamp in month and day format', () => {
      const studentProgress = {lastTimestamp: 1614841198};
      expect(formatLastUpdated(studentProgress)).toBe('3/4');
    });
  });

  describe('getSummaryCellFormatters', () => {
    const student = {id: 1};
    const lesson = fakeLessonWithLevels();
    const lessonProgressByStudent = {
      [student.id]: {
        [lesson.id]: {
          incompletePercent: 20,
          imperfectPercent: 20,
          completedPercent: 60,
          timeSpent: 300, // time spent = 5 minutes
          lastTimestamp: 1614841198, // date = 3/4
        },
      },
    };

    const summaryCellFormatters = getSummaryCellFormatters(
      lessonProgressByStudent,
      () => {}
    );

    it('returns an array of 3 formatters', () => {
      expect(summaryCellFormatters).toHaveLength(3);
    });

    it('the first formatter returns a ProgressTableSummaryCell when called', () => {
      const mainCellFormatter = summaryCellFormatters[0];
      const mainCell = mount(mainCellFormatter(lesson, student));
      expect(mainCell.name()).toBe('ProgressTableSummaryCell');
    });

    it('the second formatter returns time spent in a span when called', () => {
      const secondCellFormatter = summaryCellFormatters[1];
      const secondCell = mount(secondCellFormatter(lesson, student));
      expect(secondCell.name()).toBe('span');
      expect(secondCell.text()).toBe('5');
    });

    it('the third formatter returns last updated in a span when called', () => {
      const thirdCellFormatter = summaryCellFormatters[2];
      const thirdCell = mount(thirdCellFormatter(lesson, student));
      expect(thirdCell.name()).toBe('span');
      expect(thirdCell.text()).toBe('3/4');
    });
  });

  describe('getDetailCellFormatters', () => {
    const lesson = fakeLessonWithLevels({}, 3); // 3 levels
    const students = fakeStudents(1);
    const student = students[0];
    const sectionId = 1;

    // creates progress with last updated = 3/4 and time spent = 5 minutes
    const levelProgressByStudent = fakeStudentLevelProgress(
      lesson.levels,
      students,
      {time_spent: 300, last_progress_at: 1614841198}
    );

    const detailCellformatters = getDetailCellFormatters(
      levelProgressByStudent,
      sectionId
    );

    it('returns an array of 3 formatters', () => {
      expect(detailCellformatters).toHaveLength(3);
    });

    it('the first formatter returns a ProgressTableDetailCell when called', () => {
      const mainCellFormatter = detailCellformatters[0];
      const mainCell = mount(mainCellFormatter(lesson, student));
      expect(mainCell.name()).toBe('ProgressTableDetailCell');
    });

    it('the second formatter returns a ProgressTableLevelSpacer where are formatted by formatTimeSpent', () => {
      const secondCellFormatter = detailCellformatters[1];
      const secondCell = mount(secondCellFormatter(lesson, student));
      expect(secondCell.name()).toBe('ProgressTableLevelSpacer');
      expect(secondCell.props().items.map(i => i.node)).toEqual([
        '5',
        '5',
        '5',
      ]); // 5 minutes (3 times, once for each level)
    });

    it('the third formatter returns a ProgressTableLevelSpacer where items are formatted by formatLastUpdated', () => {
      const thirdCellFormatter = detailCellformatters[2];
      const thirdCell = mount(thirdCellFormatter(lesson, student));
      expect(thirdCell.name()).toBe('ProgressTableLevelSpacer');
      expect(thirdCell.props().items.map(i => i.node)).toEqual([
        '3/4',
        '3/4',
        '3/4',
      ]); // date = 3/4 (3 times, once for each level)
    });
  });
});
