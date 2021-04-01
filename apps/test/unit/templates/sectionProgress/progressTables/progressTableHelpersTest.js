import {expect} from '../../../../util/reconfiguredChai';
import {
  timeSpentFormatter,
  lastUpdatedFormatter
} from '@cdo/apps/templates/sectionProgress/progressTables/progressTableHelpers';

describe('progressTableHelpers', () => {
  describe('timeSpentFormatter', () => {
    it('returns "" when progress is null', () => {
      expect(timeSpentFormatter(null)).to.equal('');
    });

    it('returns "" when timeSpent is 0', () => {
      const studentProgress = {timeSpent: 0};
      expect(timeSpentFormatter(studentProgress)).to.equal('');
    });

    it('returns "-" when timeSpent is null (default value)', () => {
      const studentProgress = {timeSpent: null};
      expect(timeSpentFormatter(studentProgress)).to.equal('-');
    });

    it('returns timeSpent in minutes', () => {
      const studentProgress = {timeSpent: 140}; // 140 seconds = 2 minutes
      expect(timeSpentFormatter(studentProgress)).to.equal('2');
    });
  });

  describe('lastUpdatedFormatter', () => {
    it('returns "" when progress is null', () => {
      expect(lastUpdatedFormatter(null)).to.equal('');
    });

    it('returns "" when lastTimestamp is 0', () => {
      const studentProgress = {lastTimestamp: 0};
      expect(lastUpdatedFormatter(studentProgress)).to.equal('');
    });

    it('returns "-" when lastTimestamp is null (default)', () => {
      const studentProgress = {lastTimestamp: null};
      expect(lastUpdatedFormatter(studentProgress)).to.equal('-');
    });

    it('returns timestamp in month and day format', () => {
      const studentProgress = {lastTimestamp: 1614841198};
      expect(lastUpdatedFormatter(studentProgress)).to.equal('3/4');
    });
  });
});
