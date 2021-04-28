import {expect} from '../../../../util/reconfiguredChai';
import {mount} from 'enzyme';
import {
  getSummaryCellFormatters,
  getDetailCellFormatters,
  unitTestExports
} from '@cdo/apps/templates/sectionProgress/progressTables/progressTableHelpers';
import {
  fakeLessonWithLevels,
  fakeSection,
  fakeStudents,
  fakeStudentLevelProgress
} from '@cdo/apps/templates/progress/progressTestHelpers';

describe('progressTableHelpers', () => {
  describe('formatTimeSpent', () => {
    const formatTimeSpent = unitTestExports.formatTimeSpent;

    it('returns "" when progress is null', () => {
      expect(formatTimeSpent(null)).to.equal('');
    });

    it('returns "" when timeSpent is 0', () => {
      const studentProgress = {timeSpent: 0};
      expect(formatTimeSpent(studentProgress)).to.equal('');
    });

    it('returns "-" when timeSpent is null (default value)', () => {
      const studentProgress = {timeSpent: null};
      expect(formatTimeSpent(studentProgress)).to.equal('-');
    });

    it('returns timeSpent in minutes', () => {
      // 140 seconds rounds up to 3 minutes
      const studentProgress = {timeSpent: 140};
      expect(formatTimeSpent(studentProgress)).to.equal('3');
    });
  });

  describe('formatLastUpdated', () => {
    const formatLastUpdated = unitTestExports.formatLastUpdated;
    it('returns "" when progress is null', () => {
      expect(formatLastUpdated(null)).to.equal('');
    });

    it('returns "" when lastTimestamp is 0', () => {
      const studentProgress = {lastTimestamp: 0};
      expect(formatLastUpdated(studentProgress)).to.equal('');
    });

    it('returns "-" when lastTimestamp is null (default)', () => {
      const studentProgress = {lastTimestamp: null};
      expect(formatLastUpdated(studentProgress)).to.equal('-');
    });

    it('returns timestamp in month and day format', () => {
      const studentProgress = {lastTimestamp: 1614841198};
      expect(formatLastUpdated(studentProgress)).to.equal('3/4');
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
          lastTimestamp: 1614841198 // date = 3/4
        }
      }
    };

    const summaryCellFormatters = getSummaryCellFormatters(
      lessonProgressByStudent,
      () => {}
    );

    it('returns an array of 3 formatters', () => {
      expect(summaryCellFormatters).to.have.length(3);
    });

    it('the first formatter returns a ProgressTableSummaryCell when called', () => {
      const mainCellFormatter = summaryCellFormatters[0];
      const mainCell = mount(mainCellFormatter(lesson, student));
      expect(mainCell.name()).to.equal('ProgressTableSummaryCell');
    });

    it('the second formatter returns time spent in a span when called', () => {
      const secondCellFormatter = summaryCellFormatters[1];
      const secondCell = mount(secondCellFormatter(lesson, student));
      expect(secondCell.name()).to.equal('span');
      expect(secondCell.text()).to.equal('5');
    });

    it('the third formatter returns last updated in a span when called', () => {
      const thirdCellFormatter = summaryCellFormatters[2];
      const thirdCell = mount(thirdCellFormatter(lesson, student));
      expect(thirdCell.name()).to.equal('span');
      expect(thirdCell.text()).to.equal('3/4');
    });
  });

  describe('getDetailCellFormatters', () => {
    const lesson = fakeLessonWithLevels({}, 3); // 3 levels
    const students = fakeStudents(1);
    const student = students[0];
    const section = fakeSection(students);

    // creates progress with last updated = 3/4 and time spent = 5 minutes
    const levelProgressByStudent = fakeStudentLevelProgress(
      lesson.levels,
      students,
      {time_spent: 300, last_progress_at: 1614841198}
    );

    const detailCellformatters = getDetailCellFormatters(
      levelProgressByStudent,
      section
    );

    it('returns an array of 3 formatters', () => {
      expect(detailCellformatters).to.have.length(3);
    });

    it('the first formatter returns a ProgressTableDetailCell when called', () => {
      const mainCellFormatter = detailCellformatters[0];
      const mainCell = mount(mainCellFormatter(lesson, student));
      expect(mainCell.name()).to.equal('ProgressTableDetailCell');
    });

    it('the second formatter returns a ProgressTableLevelSpacer where are formatted by formatTimeSpent', () => {
      const secondCellFormatter = detailCellformatters[1];
      const secondCell = mount(secondCellFormatter(lesson, student));
      expect(secondCell.name()).to.equal('ProgressTableLevelSpacer');
      expect(secondCell.props().items.map(i => i.node)).to.deep.equal([
        '5',
        '5',
        '5'
      ]); // 5 minutes (3 times, once for each level)
    });

    it('the third formatter returns a ProgressTableLevelSpacer where items are formatted by formatLastUpdated', () => {
      const thirdCellFormatter = detailCellformatters[2];
      const thirdCell = mount(thirdCellFormatter(lesson, student));
      expect(thirdCell.name()).to.equal('ProgressTableLevelSpacer');
      expect(thirdCell.props().items.map(i => i.node)).to.deep.equal([
        '3/4',
        '3/4',
        '3/4'
      ]); // date = 3/4 (3 times, once for each level)
    });
  });
});
