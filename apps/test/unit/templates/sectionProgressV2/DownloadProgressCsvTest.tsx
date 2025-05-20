import {
  getLessonProgressCSVData,
  getLevelProgressCSVData,
} from '@cdo/apps/templates/sectionProgressV2/DownloadProgressCsv';
import {Student} from '@cdo/apps/types/redux';

describe('getLessonProgressCSVData', () => {
  it('creates empty CSV data when there are no students or lessons', () => {
    const students: Student[] = [];
    const unitData = {
      lessons: [],
      name: 'csp4-2025',
      id: 123,
    };
    const lessonProgressByStudent = {};

    const result = getLessonProgressCSVData(
      students,
      unitData,
      lessonProgressByStudent
    );

    expect(result.columnNames).toEqual(['Student_Name']);
    expect(result.table).toEqual([]);
  });

  it('formats data correctly for two students and two lessons', () => {
    const students = [
      {id: 101, name: 'Alice', familyName: 'Smith'},
      {id: 102, name: 'Bob', familyName: 'Jones'},
    ];

    const unitData = {
      id: 123,
      name: 'csp4-2025',
      lessons: [
        {id: 1001, title: 'Lesson One', name: 'lesson_one'},
        {id: 1002, title: 'Lesson Two', name: 'lesson_two'},
      ],
    };

    const lessonProgressByStudent = {
      101: {
        1001: {completedPercent: 100},
        1002: {completedPercent: 0},
      },
      102: {
        1001: {completedPercent: 50},
        1002: {completedPercent: 75},
      },
    };

    const result = getLessonProgressCSVData(
      students,
      unitData,
      lessonProgressByStudent
    );

    expect(result.columnNames).toEqual([
      'Student_Name',
      'Lesson One',
      'Lesson Two',
    ]);

    expect(result.table).toEqual([
      {
        Student_Name: 'Alice Smith',
        'Lesson One': '100%',
        'Lesson Two': '0%',
      },
      {
        Student_Name: 'Bob Jones',
        'Lesson One': '50%',
        'Lesson Two': '75%',
      },
    ]);
  });
});

describe('getLevelProgressCSVData', () => {
  it('creates empty CSV data when there are no students or lessons', () => {
    const students: Student[] = [];
    const unitData = {
      lessons: [],
      name: 'csp4-2025',
      id: 123,
    };
    const levelProgressByStudent = {};

    const result = getLevelProgressCSVData(
      students,
      unitData,
      levelProgressByStudent
    );

    expect(result.columnNames).toEqual(['Student_Name']);
    expect(result.table).toEqual([]);
  });

  it('formats data correctly for levels including sublevels', () => {
    const students = [
      {id: 101, name: 'Alice', familyName: 'Smith'},
      {id: 102, name: 'Bob', familyName: 'Jones'},
    ];

    const unitData = {
      id: 123,
      name: 'csp4-2025',
      lessons: [
        {
          id: 1001,
          title: 'Lesson One',
          name: 'lesson_one',
          relative_position: 1,
          levels: [
            {
              id: '201',
              bubbleText: '1',
            },
            {
              id: '202',
              bubbleText: '2',
              sublevels: [
                {id: '203', bubbleText: 'a'},
                {id: '204', bubbleText: 'b'},
              ],
            },
            {
              id: '205',
              bubbleText: '3',
            },
          ],
        },
        {
          id: 1002,
          title: 'Lesson Two',
          name: 'lesson_two',
          relative_position: 2,
          levels: [
            {
              id: '301',
              bubbleText: '1',
              isValidated: true,
            },
          ],
        },
      ],
    };

    const levelProgressByStudent = {
      101: {
        201: {status: 'perfect'},
        203: {status: 'perfect'},
        204: null,
        301: {status: 'completed_assessment'},
      },
      102: {
        201: {status: 'attempted'},
        203: {status: 'perfect'},
        204: {status: 'perfect'},
        301: {status: 'in_progress'},
      },
    };

    const result = getLevelProgressCSVData(
      students,
      unitData,
      levelProgressByStudent
    );

    expect(result.columnNames).toEqual([
      'Student_Name',
      '1.1',
      '1.2a',
      '1.2b',
      '1.3',
      '2.1',
    ]);

    expect(result.table).toEqual([
      {
        Student_Name: 'Alice Smith',
        '1.1': 'Submitted',
        '1.2a': 'Submitted',
        '1.2b': 'No progress',
        '1.3': 'No progress',
        '2.1': 'Validated',
      },
      {
        Student_Name: 'Bob Jones',
        '1.1': 'In progress',
        '1.2a': 'Submitted',
        '1.2b': 'Submitted',
        '1.3': 'No progress',
        '2.1': 'No progress',
      },
    ]);
  });

  it('formats data correctly for locked levels in a lesson', () => {
    const students = [{id: 101, name: 'Alice', familyName: 'Smith'}];

    const unitData = {
      id: 123,
      name: 'csp4-2025',
      lessons: [
        {
          id: 1001,
          title: 'Locked Lesson',
          name: 'locked_lesson',
          relative_position: 1,
          lockable: true,
          levels: [
            {
              id: '201',
              bubbleText: '1',
            },
            {
              id: '202',
              bubbleText: '2',
            },
          ],
        },
        {
          id: 1002,
          title: 'Normal Lesson',
          name: 'normal_lesson',
          relative_position: 2,
          levels: [
            {
              id: '301',
              bubbleText: '1',
            },
          ],
        },
      ],
    };

    const levelProgressByStudent = {
      101: {
        201: {status: 'perfect'},
        202: {status: 'attempted'},
        301: {status: 'perfect'},
      },
    };

    const result = getLevelProgressCSVData(
      students,
      unitData,
      levelProgressByStudent
    );

    expect(result.columnNames).toEqual([
      'Student_Name',
      'Locked Lesson 1/2',
      'Locked Lesson 2/2',
      '2.1',
    ]);

    expect(result.table).toEqual([
      {
        Student_Name: 'Alice Smith',
        'Locked Lesson 1/2': 'Submitted',
        'Locked Lesson 2/2': 'In progress',
        '2.1': 'Submitted',
      },
    ]);
  });
});
