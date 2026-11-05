import Checkbox from '@code-dot-org/component-library/checkbox';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import classNames from 'classnames';
import React from 'react';

import {getFullName} from '@cdo/apps/templates/manageStudents/utils';

import {checkedState} from './selectionReducer';
import {Section, SectionSelection} from './types';

import styles from './exportStudentData.module.scss';

interface SectionRowProps {
  section: Section;
  selection: SectionSelection;
  expanded: boolean;
  onToggleExpanded: () => void;
  onToggleSection: () => void;
  onToggleStudent: (studentId: number) => void;
  onToggleUnit: (unitName: string) => void;
  onSetAllStudents: (selected: boolean) => void;
  onSetAllUnits: (selected: boolean) => void;
}

const SectionRow: React.FunctionComponent<SectionRowProps> = ({
  section,
  selection,
  expanded,
  onToggleExpanded,
  onToggleSection,
  onToggleStudent,
  onToggleUnit,
  onSetAllStudents,
  onSetAllUnits,
}) => {
  const assigned = section.units.length > 0;
  const hasStudents = section.students.length > 0;
  const selectable = assigned && hasStudents;

  const state = checkedState(
    selection.studentIds.size,
    section.students.length
  );
  const unitsState = checkedState(
    selection.unitNames.size,
    section.units.length
  );
  const detailId = `export-section-${section.id}-detail`;

  // Only show the unit checkboxes if it's a multi-unit course
  const showUnitPicker = section.units.length > 1;

  const assignmentLabel = () => {
    if (!assigned) {
      return 'No course or unit assigned';
    }
    if (section.courseName) {
      return section.courseName;
    }
    return section.units[0].title;
  };

  return (
    <>
      <tr className={classNames(!selectable && styles.disabledRow)}>
        <td className={styles.checkboxCell}>
          <Checkbox
            name={`export-section-${section.id}`}
            label={section.name}
            checked={state === 'checked'}
            indeterminate={state === 'indeterminate'}
            disabled={!selectable}
            onChange={onToggleSection}
          />
        </td>
        <td>
          <button
            type="button"
            className={styles.expandButton}
            onClick={onToggleExpanded}
            disabled={!selectable}
            aria-expanded={expanded}
            aria-controls={detailId}
          >
            <FontAwesomeV6Icon
              iconName={expanded ? 'caret-down' : 'caret-right'}
              iconStyle="solid"
            />
            {expanded ? 'Hide students' : 'Show students'}
          </button>
        </td>
        <td>{assignmentLabel()}</td>
        <td className={styles.countCell}>
          {hasStudents ? section.students.length : 'No students'}
        </td>
      </tr>

      <tr id={detailId} hidden={!expanded}>
        <td className={styles.detailCell} colSpan={4}>
          {showUnitPicker && (
            <fieldset className={styles.fieldset}>
              <legend className={styles.legend}>
                <Checkbox
                  name={`export-section-${section.id}-units-all`}
                  label="Units"
                  textThickness="thick"
                  checked={unitsState === 'checked'}
                  indeterminate={unitsState === 'indeterminate'}
                  onChange={() => onSetAllUnits(unitsState !== 'checked')}
                />
              </legend>
              {unitsState === 'unchecked' && (
                <p className={styles.warningText}>
                  Select at least one unit to export this section.
                </p>
              )}
              <div className={styles.checkboxGrid}>
                {section.units.map(unit => (
                  <Checkbox
                    key={unit.name}
                    name={`export-section-${section.id}-unit-${unit.name}`}
                    label={unit.title}
                    checked={selection.unitNames.has(unit.name)}
                    onChange={() => onToggleUnit(unit.name)}
                  />
                ))}
              </div>
            </fieldset>
          )}

          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>
              <Checkbox
                name={`export-section-${section.id}-students-all`}
                label="Students"
                textThickness="thick"
                checked={state === 'checked'}
                indeterminate={state === 'indeterminate'}
                onChange={() => onSetAllStudents(state !== 'checked')}
              />
            </legend>
            {state === 'unchecked' && (
              <p className={styles.warningText}>
                Select at least one student to export this section.
              </p>
            )}
            <div className={styles.checkboxGrid}>
              {section.students.map(student => (
                <Checkbox
                  key={student.id}
                  name={`export-section-${section.id}-student-${student.id}`}
                  label={
                    <>
                      {getFullName(student)}
                      {!student.username && (
                        <span className={styles.noUsername}>
                          {' '}
                          (no username)
                        </span>
                      )}
                    </>
                  }
                  checked={selection.studentIds.has(student.id)}
                  onChange={() => onToggleStudent(student.id)}
                />
              ))}
            </div>
          </fieldset>
        </td>
      </tr>
    </>
  );
};

export default SectionRow;
