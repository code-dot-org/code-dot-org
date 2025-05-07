import {getLessonProgressCSVData} from '@cdo/apps/templates/sectionProgressV2/DownloadProgressCsv';
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
    expect(result.unitName).toEqual('csp4-2025');
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

    expect(result.unitName).toEqual('csp4-2025');
  });
});
