import {ExportRow, Section, Selection} from './types';

/**
 * Flattens the selection into CSV rows: every selected student crossed with
 * every selected unit of their section.
 *
 * A student enrolled in two selected sections that resolve to the same unit
 * yields one row, not two
 */
export function buildExportRows(
  sections: Section[],
  selection: Selection
): ExportRow[] {
  const rows: ExportRow[] = [];
  const seen = new Set<string>();

  sections.forEach(section => {
    const sectionSelection = selection[section.id];
    if (!sectionSelection) {
      return;
    }

    // A section with one unit has no unit-picker UI
    // The single unit is implicit whenever any student in that section is checked.
    const units =
      section.units.length > 1
        ? section.units.filter(unit =>
            sectionSelection.unitNames.has(unit.name)
          )
        : section.units;
    const students = section.students.filter(student =>
      sectionSelection.studentIds.has(student.id)
    );

    students.forEach(student => {
      units.forEach(unit => {
        const key = `${student.id}|${unit.name}`;
        if (seen.has(key)) {
          return;
        }
        seen.add(key);

        rows.push({
          student_username: student.username || '',
          student_id: String(student.id),
          unit_name: unit.name,
        });
      });
    });
  });

  return rows;
}
