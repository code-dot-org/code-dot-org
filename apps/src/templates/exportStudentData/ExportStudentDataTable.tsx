import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button, Typography} from '@mui/material';
import React, {useCallback, useMemo, useReducer, useState} from 'react';

import {buildCSVString} from '@cdo/apps/templates/sectionProgressV2/DownloadProgressCsv';

import {buildExportRows} from './buildExportRows';
import SectionRow from './SectionRow';
import {
  initialSelection,
  selectionReducer,
  SelectionAction,
} from './selectionReducer';
import {CSV_COLUMNS, Section, SectionSelection} from './types';

import styles from './exportStudentData.module.scss';

const EMPTY_SELECTION: SectionSelection = {
  studentIds: new Set<number>(),
  unitNames: new Set<string>(),
};

const downloadCsv = (fileName: string, csvString: string) => {
  const blob = new Blob([csvString], {type: 'text/csv'});
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const today = () => new Date().toISOString().slice(0, 10);

interface ExportStudentDataTableProps {
  sections: Section[];
}

const ExportStudentDataTable: React.FunctionComponent<
  ExportStudentDataTableProps
> = ({sections}) => {
  const [selection, dispatch] = useReducer(
    selectionReducer,
    initialSelection()
  );
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [archivedOpen, setArchivedOpen] = useState(false);

  const visibleSections = useMemo(
    () => sections.filter(section => !section.hidden),
    [sections]
  );
  const archivedSections = useMemo(
    () => sections.filter(section => section.hidden),
    [sections]
  );

  const rows = useMemo(
    () => buildExportRows(sections, selection),
    [sections, selection]
  );

  const selectedStudentCount = useMemo(
    () =>
      new Set(Object.values(selection).flatMap(s => Array.from(s.studentIds)))
        .size,
    [selection]
  );
  const selectedSectionCount = useMemo(
    () => Object.values(selection).filter(s => s.studentIds.size > 0).length,
    [selection]
  );

  const toggleExpanded = useCallback((sectionId: number) => {
    setExpandedIds(previous => {
      const next = new Set(previous);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  }, []);

  const handleExport = useCallback(() => {
    const csvString = buildCSVString(
      [...CSV_COLUMNS],
      rows as unknown as {[columnName: string]: string}[]
    );
    downloadCsv(`student_data_export_${today()}.csv`, csvString);
  }, [rows]);

  const renderSection = (section: Section) => (
    <SectionRow
      key={section.id}
      section={section}
      selection={selection[section.id] || EMPTY_SELECTION}
      expanded={expandedIds.has(section.id)}
      onToggleExpanded={() => toggleExpanded(section.id)}
      onToggleSection={() =>
        dispatch({type: 'TOGGLE_SECTION', section} as SelectionAction)
      }
      onToggleStudent={studentId =>
        dispatch({type: 'TOGGLE_STUDENT', section, studentId})
      }
      onToggleUnit={unitName =>
        dispatch({type: 'TOGGLE_UNIT', section, unitName})
      }
      onSetAllStudents={selected =>
        dispatch({type: 'SET_ALL_STUDENTS', section, selected})
      }
      onSetAllUnits={selected =>
        dispatch({type: 'SET_ALL_UNITS', section, selected})
      }
    />
  );

  return (
    <div className={styles.page}>
      <Typography variant="h2" component="h1">
        Export Student Data
      </Typography>
      <div className={styles.intro}>
        <Typography variant="body2">
          Select sections and students to export a CSV of usernames, student IDs
          and assigned unit names. Sections without a course or unit assigned
          cannot be exported. Sections assigned a multi-unit course produce one
          row per student per selected unit.
        </Typography>
      </div>

      {sections.length === 0 ? (
        <p className={styles.emptyState}>You have no sections to export.</p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table} aria-label="Your sections">
            <thead>
              <tr>
                <th scope="col">Section</th>
                <th scope="col">Students</th>
                <th scope="col">Course / Unit</th>
                <th scope="col" className={styles.countCell}>
                  Count
                </th>
              </tr>
            </thead>

            <tbody>{visibleSections.map(renderSection)}</tbody>

            {archivedSections.length > 0 && (
              <tbody>
                <tr>
                  <td colSpan={4}>
                    <button
                      type="button"
                      className={styles.groupHeader}
                      onClick={() => setArchivedOpen(open => !open)}
                      aria-expanded={archivedOpen}
                      aria-controls="export-archived-sections"
                    >
                      <FontAwesomeV6Icon
                        iconName={archivedOpen ? 'caret-down' : 'caret-right'}
                        iconStyle="solid"
                      />
                      {` Archived Sections (${archivedSections.length})`}
                    </button>
                  </td>
                </tr>
              </tbody>
            )}

            {archivedSections.length > 0 && (
              <tbody id="export-archived-sections" hidden={!archivedOpen}>
                {archivedSections.map(renderSection)}
              </tbody>
            )}
          </table>
        </div>
      )}

      <div className={styles.footer}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleExport}
          disabled={rows.length === 0}
        >
          Export CSV
        </Button>
        <Typography variant="body2">
          {rows.length === 0
            ? 'Select at least one student to export.'
            : `${rows.length} row${rows.length === 1 ? '' : 's'} from ` +
              `${selectedStudentCount} student${
                selectedStudentCount === 1 ? '' : 's'
              } in ${selectedSectionCount} section${
                selectedSectionCount === 1 ? '' : 's'
              }`}
        </Typography>
      </div>
    </div>
  );
};

export default ExportStudentDataTable;
