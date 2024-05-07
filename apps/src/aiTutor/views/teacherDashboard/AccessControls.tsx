import React, {useEffect, useState} from 'react';
import {fetchStudents} from '@cdo/apps/aiTutor/accessControlsApi';
import style from './interactions-table.module.scss';
import {StudentAccessData} from '@cdo/apps/aiTutor/types';
import * as Table from 'reactabular-table';

import {tableLayoutStyles as tableStyles} from '@cdo/apps/templates/tables/tableConstants';
import {styleOverrides} from './InteractionsTable';
import StudentAccessToggle from './StudentAccessToggle';

/**
 * Renders toggles to control student access to AI Tutor.
 */

interface AccessControlsProps {
  sectionId: number;
}

const AccessControls: React.FC<AccessControlsProps> = ({sectionId}) => {
  const [students, setStudents] = useState<StudentAccessData[]>([]);
  const [globalErrorMessage, setGlobalErrorMessage] = useState<string | null>(
    null
  );

  const displayGlobalError = (error: string) => {
    setGlobalErrorMessage(error);
    setTimeout(() => setGlobalErrorMessage(null), 5000);
  };

  useEffect(() => {
    (async () => {
      try {
        const students = await fetchStudents(sectionId);
        setStudents(students);
      } catch (error) {
        displayGlobalError('Failed to fetch students. Please try again.');
      }
    })();
  }, [sectionId]);

  const columns = [
    {
      property: 'id',
      header: {
        label: 'Student ID',
        props: {
          style: {...tableStyles.headerCell, ...styleOverrides.headerCell},
        },
      },
      cell: {
        formatters: [(id: string) => <span>{id}</span>],
        props: {style: {...tableStyles.cell, minWidth: '100px'}},
      },
    },
    {
      property: 'name',
      header: {
        label: 'Name',
        props: {
          style: {...tableStyles.headerCell, ...styleOverrides.headerCell},
        },
      },
      cell: {
        formatters: [(name: string) => <span>{name}</span>],
        props: {style: {...tableStyles.cell, minWidth: '150px'}},
      },
    },
    {
      property: 'aiTutorAccessDenied',
      header: {
        label: 'AI Tutor Access',
        props: {
          style: {
            ...tableStyles.headerCell,
            ...styleOverrides.headerCell,
            minWidth: '150px',
          },
        },
      },
      cell: {
        formatters: [
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (aiTutorAccessDenied: boolean, {rowData}: any) => (
            <StudentAccessToggle
              aiTutorAccessDenied={aiTutorAccessDenied}
              displayGlobalError={displayGlobalError}
              studentId={rowData?.id}
            />
          ),
        ],
        props: {style: {...tableStyles.cell}},
      },
    },
  ];

  return (
    <div className={style.interactionsElement}>
      {globalErrorMessage && (
        <div className={style.alert}>{globalErrorMessage}</div>
      )}
      <Table.Provider
        columns={columns}
        style={{...tableStyles.table, ...styleOverrides.table}}
      >
        <Table.Header />
        <Table.Body
          rows={students.map(student => ({
            id: student.id,
            name: student.name,
            aiTutorAccessDenied: student.aiTutorAccessDenied,
          }))}
          rowKey="id"
        />
      </Table.Provider>
    </div>
  );
};

export default AccessControls;
