import {render, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import ExportStudentDataTable from '@cdo/apps/templates/exportStudentData/ExportStudentDataTable';
import {Section} from '@cdo/apps/templates/exportStudentData/types';

const unit = (name: string) => ({name, title: name.toUpperCase()});

const SECTION: Section = {
  id: 1,
  name: 'Period 1',
  hidden: false,
  courseName: null,
  units: [unit('csd1-2023')],
  students: [
    {id: 10, username: 'paul_atreides', name: 'Paul', familyName: 'Atreides'},
    {id: 11, username: 'duncan_idaho', name: 'Duncan', familyName: 'Idaho'},
  ],
};

const renderTable = (sections: Section[]) =>
  render(<ExportStudentDataTable sections={sections} />);

const sectionCheckbox = (name: string) =>
  screen.getByRole('checkbox', {name}) as HTMLInputElement;

const checkboxWithin = (container: HTMLElement, name: string) =>
  within(container).getByRole('checkbox', {name}) as HTMLInputElement;

describe('ExportStudentDataTable', () => {
  it('starts with nothing selected and export disabled', () => {
    renderTable([SECTION]);

    expect(screen.getByRole('button', {name: 'Export CSV'})).toBeDisabled();
    expect(
      screen.getByText('Select at least one student to export.')
    ).toBeDefined();
  });

  it('selecting a section selects all of its students', async () => {
    renderTable([SECTION]);

    await userEvent.click(sectionCheckbox('Period 1'));

    expect(sectionCheckbox('Period 1').checked).toBe(true);
    expect(
      screen.getByText(/2 rows from 2 students in 1 section/)
    ).toBeDefined();
    expect(screen.getByRole('button', {name: 'Export CSV'})).not.toBeDisabled();
  });

  it('deselecting one student makes the section indeterminate', async () => {
    renderTable([SECTION]);

    await userEvent.click(sectionCheckbox('Period 1'));
    await userEvent.click(screen.getByRole('button', {name: /Show students/}));
    await userEvent.click(sectionCheckbox('Paul Atreides'));

    const section = sectionCheckbox('Period 1');
    expect(section.checked).toBe(false);
    expect(section.indeterminate).toBe(true);
    expect(screen.getByText(/1 row from 1 student in 1 section/)).toBeDefined();
  });

  it('expanding toggles aria-expanded and reveals students', async () => {
    renderTable([SECTION]);

    const toggle = screen.getByRole('button', {name: /Show students/});
    expect(toggle.getAttribute('aria-expanded')).toBe('false');

    await userEvent.click(toggle);

    expect(
      screen
        .getByRole('button', {name: /Hide students/})
        .getAttribute('aria-expanded')
    ).toBe('true');
    expect(screen.getByRole('checkbox', {name: 'Duncan Idaho'})).toBeDefined();
  });

  it("shows the student's full name, not their username", async () => {
    renderTable([SECTION]);

    await userEvent.click(screen.getByRole('button', {name: /Show students/}));

    // The checkbox's accessible name comes from its visible label.
    expect(screen.getByRole('checkbox', {name: 'Paul Atreides'})).toBeDefined();
    expect(screen.queryByText('paul_atreides')).toBeNull();
  });

  it('flags a student with no username without hiding their name', async () => {
    const section: Section = {
      ...SECTION,
      students: [{id: 12, username: null, name: 'Chani', familyName: 'Kynes'}],
    };
    renderTable([section]);

    await userEvent.click(screen.getByRole('button', {name: /Show students/}));

    expect(
      screen.getByRole('checkbox', {name: 'Chani Kynes (no username)'})
    ).toBeDefined();
  });

  it('disables a section with no unit assigned', () => {
    renderTable([{...SECTION, units: []}]);

    expect(sectionCheckbox('Period 1')).toBeDisabled();
    expect(screen.getByText('No course or unit assigned')).toBeDefined();
  });

  it('disables a section with no students', () => {
    renderTable([{...SECTION, students: []}]);

    expect(sectionCheckbox('Period 1')).toBeDisabled();
    expect(screen.getByText('No students')).toBeDefined();
  });

  it('keeps the archived group collapsed until it is opened', async () => {
    const archived: Section = {
      ...SECTION,
      id: 2,
      name: 'Last Year',
      hidden: true,
    };
    renderTable([SECTION, archived]);

    const group = screen.getByRole('button', {name: /Archived Sections \(1\)/});
    expect(group.getAttribute('aria-expanded')).toBe('false');

    await userEvent.click(group);

    expect(group.getAttribute('aria-expanded')).toBe('true');
    expect(sectionCheckbox('Last Year')).toBeDefined();
  });

  it('multiplies students by units for a course-assigned section', async () => {
    const course: Section = {
      ...SECTION,
      courseName: 'CSD',
      units: [unit('csd1-2023'), unit('csd2-2023'), unit('csd3-2023')],
    };
    renderTable([course]);

    await userEvent.click(sectionCheckbox('Period 1'));

    expect(
      screen.getByText(/6 rows from 2 students in 1 section/)
    ).toBeDefined();
  });

  it('allows the last unit to be deselected, warning instead of blocking', async () => {
    const course: Section = {
      ...SECTION,
      courseName: 'CSD',
      units: [unit('csd1-2023'), unit('csd2-2023')],
    };
    renderTable([course]);

    await userEvent.click(sectionCheckbox('Period 1'));
    await userEvent.click(screen.getByRole('button', {name: /Show students/}));

    const units = screen.getByRole('group', {name: 'Units'});
    expect(
      within(units).queryByText(
        'Select at least one unit to export this section.'
      )
    ).toBeNull();

    await userEvent.click(
      within(units).getByRole('checkbox', {name: 'CSD1-2023'})
    );
    await userEvent.click(
      within(units).getByRole('checkbox', {name: 'CSD2-2023'})
    );

    // Both units are now off, and neither checkbox is disabled.
    expect(
      (
        within(units).getByRole('checkbox', {
          name: 'CSD1-2023',
        }) as HTMLInputElement
      ).checked
    ).toBe(false);
    expect(
      (
        within(units).getByRole('checkbox', {
          name: 'CSD2-2023',
        }) as HTMLInputElement
      ).checked
    ).toBe(false);
    expect(
      within(units).getByText(
        'Select at least one unit to export this section.'
      )
    ).toBeDefined();
    // With no units selected, this section contributes nothing.
    expect(
      screen.getByText('Select at least one student to export.')
    ).toBeDefined();
  });

  it('warns under Students when a selectable section has none checked', async () => {
    renderTable([SECTION]);

    await userEvent.click(screen.getByRole('button', {name: /Show students/}));

    const students = screen.getByRole('group', {name: 'Students'});
    expect(
      within(students).getByText(
        'Select at least one student to export this section.'
      )
    ).toBeDefined();

    await userEvent.click(sectionCheckbox('Paul Atreides'));

    expect(
      within(students).queryByText(
        'Select at least one student to export this section.'
      )
    ).toBeNull();
  });

  it('the Units checkbox selects, deselects, and goes indeterminate for its group', async () => {
    const course: Section = {
      ...SECTION,
      courseName: 'CSD',
      units: [unit('csd1-2023'), unit('csd2-2023'), unit('csd3-2023')],
    };
    renderTable([course]);

    await userEvent.click(sectionCheckbox('Period 1'));
    await userEvent.click(screen.getByRole('button', {name: /Show students/}));

    const units = screen.getByRole('group', {name: 'Units'});
    const unitsAll = checkboxWithin(units, 'Units');
    expect(unitsAll.checked).toBe(true);

    await userEvent.click(checkboxWithin(units, 'CSD2-2023'));
    expect(unitsAll.checked).toBe(false);
    expect(unitsAll.indeterminate).toBe(true);

    // Clicking while indeterminate selects everything, not just the rest.
    await userEvent.click(unitsAll);
    expect(checkboxWithin(units, 'CSD1-2023').checked).toBe(true);
    expect(checkboxWithin(units, 'CSD2-2023').checked).toBe(true);
    expect(checkboxWithin(units, 'CSD3-2023').checked).toBe(true);
    expect(unitsAll.checked).toBe(true);

    // Clicking while fully checked deselects everything.
    await userEvent.click(unitsAll);
    expect(checkboxWithin(units, 'CSD1-2023').checked).toBe(false);
    expect(checkboxWithin(units, 'CSD2-2023').checked).toBe(false);
    expect(checkboxWithin(units, 'CSD3-2023').checked).toBe(false);
    expect(unitsAll.checked).toBe(false);
    expect(unitsAll.indeterminate).toBe(false);
  });

  it('the Students checkbox selects, deselects, and goes indeterminate for its group', async () => {
    renderTable([SECTION]);

    await userEvent.click(screen.getByRole('button', {name: /Show students/}));

    const students = screen.getByRole('group', {name: 'Students'});
    const studentsAll = checkboxWithin(students, 'Students');
    expect(studentsAll.checked).toBe(false);

    await userEvent.click(studentsAll);
    expect(sectionCheckbox('Paul Atreides').checked).toBe(true);
    expect(sectionCheckbox('Duncan Idaho').checked).toBe(true);
    expect(studentsAll.checked).toBe(true);
    // Also reflected on the section-level checkbox, which reads the same set.
    expect(sectionCheckbox('Period 1').checked).toBe(true);

    await userEvent.click(sectionCheckbox('Paul Atreides'));
    expect(studentsAll.checked).toBe(false);
    expect(studentsAll.indeterminate).toBe(true);

    await userEvent.click(studentsAll);
    expect(sectionCheckbox('Paul Atreides').checked).toBe(true);
    expect(sectionCheckbox('Duncan Idaho').checked).toBe(true);

    await userEvent.click(studentsAll);
    expect(sectionCheckbox('Paul Atreides').checked).toBe(false);
    expect(sectionCheckbox('Duncan Idaho').checked).toBe(false);
    expect(studentsAll.checked).toBe(false);
    expect(studentsAll.indeterminate).toBe(false);
  });

  it('checking a student leaves a multi-unit section untouched', async () => {
    const course: Section = {
      ...SECTION,
      courseName: 'CSD',
      units: [unit('csd1-2023'), unit('csd2-2023')],
    };
    renderTable([course]);

    await userEvent.click(screen.getByRole('button', {name: /Show students/}));
    await userEvent.click(sectionCheckbox('Paul Atreides'));

    const units = screen.getByRole('group', {name: 'Units'});
    expect(checkboxWithin(units, 'Units').checked).toBe(false);
    expect(checkboxWithin(units, 'CSD1-2023').checked).toBe(false);
    expect(checkboxWithin(units, 'CSD2-2023').checked).toBe(false);
    expect(
      within(units).getByText(
        'Select at least one unit to export this section.'
      )
    ).toBeDefined();
    // A student is checked but no unit is, so this section exports nothing.
    expect(
      screen.getByText('Select at least one student to export.')
    ).toBeDefined();

    // Independently checking a unit now produces rows for the student
    // already selected — the two controls never forced each other.
    await userEvent.click(checkboxWithin(units, 'CSD1-2023'));
    expect(screen.getByText(/1 row from 1 student in 1 section/)).toBeDefined();
  });

  it('checking a student on a one-unit section exports it without any unit control', async () => {
    renderTable([SECTION]);

    await userEvent.click(screen.getByRole('button', {name: /Show students/}));
    await userEvent.click(sectionCheckbox('Paul Atreides'));

    // SECTION has only one unit, so there is no Units fieldset to check.
    expect(screen.queryByRole('group', {name: 'Units'})).toBeNull();
    expect(screen.getByText(/1 row from 1 student in 1 section/)).toBeDefined();
  });

  it('shows an empty state when the teacher has no sections', () => {
    renderTable([]);

    expect(screen.getByText('You have no sections to export.')).toBeDefined();
  });
});
