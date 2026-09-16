import {buildExportRows} from '@cdo/apps/templates/exportStudentData/buildExportRows';
import {Section, Selection} from '@cdo/apps/templates/exportStudentData/types';

const unit = (name: string) => ({name, title: name.toUpperCase()});

const section = (overrides: Partial<Section> = {}): Section => ({
  id: 1,
  name: 'Period 1',
  hidden: false,
  courseName: null,
  units: [unit('csd1-2023')],
  students: [{id: 10, username: 'zoe_abc', name: 'Zoe A'}],
  ...overrides,
});

const selectAll = (s: Section): Selection => ({
  [s.id]: {
    studentIds: new Set(s.students.map(student => student.id)),
    unitNames: new Set(s.units.map(u => u.name)),
  },
});

describe('buildExportRows', () => {
  it('returns no rows when nothing is selected', () => {
    expect(buildExportRows([section()], {})).toEqual([]);
  });

  it('includes the single unit of a one-unit section even with no units selected', () => {
    const s = section();
    const selection: Selection = {
      [s.id]: {studentIds: new Set([10]), unitNames: new Set()},
    };

    expect(buildExportRows([s], selection)).toEqual([
      {student_username: 'zoe_abc', student_id: '10', unit_name: 'csd1-2023'},
    ]);
  });

  it('emits one row per student per unit', () => {
    const s = section({
      units: [unit('csd1-2023'), unit('csd2-2023'), unit('csd3-2023')],
      students: [
        {id: 10, username: 'zoe_abc', name: 'Zoe A'},
        {id: 11, username: 'liam_def', name: 'Liam D'},
      ],
    });

    const rows = buildExportRows([s], selectAll(s));

    expect(rows).toHaveLength(6);
    expect(rows[0]).toEqual({
      student_username: 'zoe_abc',
      student_id: '10',
      unit_name: 'csd1-2023',
    });
  });

  it('drops rows for deselected units', () => {
    const s = section({units: [unit('csd1-2023'), unit('csd2-2023')]});
    const selection: Selection = {
      [s.id]: {studentIds: new Set([10]), unitNames: new Set(['csd2-2023'])},
    };

    expect(buildExportRows([s], selection).map(r => r.unit_name)).toEqual([
      'csd2-2023',
    ]);
  });

  it('writes an empty username rather than dropping the student', () => {
    const s = section({
      students: [{id: 12, username: null, name: 'Grace H'}],
    });

    expect(buildExportRows([s], selectAll(s))).toEqual([
      {student_username: '', student_id: '12', unit_name: 'csd1-2023'},
    ]);
  });

  it('emits a student once when two selected sections share a unit', () => {
    const shared = {id: 10, username: 'zoe_abc', name: 'Zoe A'};
    const first = section({id: 1, students: [shared]});
    const second = section({id: 2, name: 'Robotics', students: [shared]});

    const rows = buildExportRows([first, second], {
      ...selectAll(first),
      ...selectAll(second),
    });

    expect(rows).toEqual([
      {student_username: 'zoe_abc', student_id: '10', unit_name: 'csd1-2023'},
    ]);
  });

  it('still emits both rows when two sections resolve to different units', () => {
    const shared = {id: 10, username: 'zoe_abc', name: 'Zoe A'};
    const first = section({id: 1, students: [shared]});
    const second = section({
      id: 2,
      name: 'Robotics',
      units: [unit('csp1-2023')],
      students: [shared],
    });

    const rows = buildExportRows([first, second], {
      ...selectAll(first),
      ...selectAll(second),
    });

    expect(rows.map(r => r.unit_name)).toEqual(['csd1-2023', 'csp1-2023']);
  });

  it('excludes sections with no units assigned', () => {
    const s = section({units: []});
    const selection: Selection = {
      [s.id]: {studentIds: new Set([10]), unitNames: new Set()},
    };

    expect(buildExportRows([s], selection)).toEqual([]);
  });

  it('ignores students that are not selected', () => {
    const s = section({
      students: [
        {id: 10, username: 'zoe_abc', name: 'Zoe A'},
        {id: 11, username: 'liam_def', name: 'Liam D'},
      ],
    });
    const selection: Selection = {
      [s.id]: {studentIds: new Set([11]), unitNames: new Set(['csd1-2023'])},
    };

    expect(buildExportRows([s], selection).map(r => r.student_id)).toEqual([
      '11',
    ]);
  });
});
