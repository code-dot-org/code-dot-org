import {
  getLockedStatusPerStudent,
  areAllLevelsLocked,
} from '@cdo/apps/templates/sectionProgressV2/LockedLessonUtils.jsx';

const STUDENT_1 = {id: 1, name: 'Student 1', familyName: 'FamNameB'};
const STUDENT_2 = {id: 2, name: 'Student 2', familyName: 'FamNameA'};
const STUDENTS = [STUDENT_1, STUDENT_2];

describe('LockedLessonUtils', () => {
  describe('getLockedStatusPerStudent', () => {
    it('is false when lesson not lockable', () => {
      const lesson = {lockable: false};
      const levelProgressByStudent = {};
      const result = getLockedStatusPerStudent(
        levelProgressByStudent,
        STUDENTS,
        lesson
      );
      expect(result).toEqual({1: false, 2: false});
    });

    it('is false when level is not locked', () => {
      const lesson = {lockable: true, levels: [{id: 1}]};
      const levelProgressByStudent = {
        1: {1: {locked: false}},
      };
      const result = getLockedStatusPerStudent(
        levelProgressByStudent,
        [STUDENT_1],
        lesson
      );
      expect(result).toEqual({1: false});
    });

    it('is false when level in list is not locked', () => {
      const lesson = {lockable: true, levels: [{id: 1}, {id: 2}]};
      const levelProgressByStudent = {
        1: {1: {locked: true}, 2: {locked: false}},
      };
      const result = getLockedStatusPerStudent(
        levelProgressByStudent,
        [STUDENT_1],
        lesson
      );
      expect(result).toEqual({1: false});
    });

    it('is true when single level is locked', () => {
      const lesson = {lockable: true, levels: [{id: 1}]};
      const levelProgressByStudent = {
        1: {1: {locked: true}},
      };
      const result = getLockedStatusPerStudent(
        levelProgressByStudent,
        [STUDENT_1],
        lesson
      );
      expect(result).toEqual({1: true});
    });

    it('is true when all levels are locked', () => {
      const lesson = {lockable: true, levels: [{id: 1}, {id: 2}]};
      const levelProgressByStudent = {
        1: {1: {locked: true}, 2: {locked: true}},
      };
      const result = getLockedStatusPerStudent(
        levelProgressByStudent,
        [STUDENT_1],
        lesson
      );
      expect(result).toEqual({1: true});
    });

    it('works for multiple students', () => {
      const lesson = {lockable: true, levels: [{id: 1}, {id: 2}]};
      const levelProgressByStudent = {
        1: {1: {locked: true}, 2: {locked: true}},
        2: {1: {locked: false}, 2: {locked: true}},
      };
      const result = getLockedStatusPerStudent(
        levelProgressByStudent,
        STUDENTS,
        lesson
      );
      expect(result).toEqual({1: true, 2: false});
    });
  });

  describe('areAllLevelsLocks', () => {
    it('not all levels are locked', () => {
      expect(areAllLevelsLocked({1: true, 2: false})).toBeFalsy();
      expect(areAllLevelsLocked({1: false, 2: false})).toBeFalsy();
      expect(areAllLevelsLocked({2: false})).toBeFalsy();
    });

    it('all levels are locked', () => {
      expect(areAllLevelsLocked({1: true, 2: true})).toBeTruthy();
      expect(areAllLevelsLocked({1: true})).toBeTruthy();
    });
  });
});
