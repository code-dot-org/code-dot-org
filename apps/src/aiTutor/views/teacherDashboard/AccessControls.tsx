import React, {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';
import * as Table from 'reactabular-table';

import {fetchStudents} from '@cdo/apps/aiTutor/accessControlsApi';
import {StudentAccessData} from '@cdo/apps/aiTutor/types';
import Spinner from '@cdo/apps/code-studio/pd/components/spinner';
import {tableLayoutStyles as tableStyles} from '@cdo/apps/templates/tables/tableConstants';

import {styleOverrides} from './InteractionsTable';
import SectionAccessToggle from './SectionAccessToggle';
import StudentAccessToggle from './StudentAccessToggle';

import style from './interactions-table.module.scss';

/**
 * Renders toggles to control student access to AI Tutor.
 */

interface AccessControlsProps {
  sectionId: number;
}

interface SectionsData {
  [index: number]: {
    aiTutorEnabled: boolean;
  };
}
interface StudentRowData {
  id: number;
  name: string;
  aiTutorAccessDenied: boolean;
}

const AccessControls: React.FC<AccessControlsProps> = ({sectionId}) => {
  const [students, setStudents] = useState<StudentAccessData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [globalErrorMessage, setGlobalErrorMessage] = useState<string | null>(
    null
  );

  const aiTutorEnabledForSection = useSelector(
    (state: {teacherSections: {sections: SectionsData}}) =>
      state.teacherSections.sections[sectionId].aiTutorEnabled
  );

  const displayGlobalError = (error: string) => {
    setGlobalErrorMessage(error);
    setTimeout(() => setGlobalErrorMessage(null), 5000);
  };

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const students = await fetchStudents(sectionId);
        setStudents(students);
      } catch (error) {
        displayGlobalError('Failed to fetch students. Please try again.');
      }
      setIsLoading(false);
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
          (
            aiTutorAccessDenied: boolean,
            {rowData}: {rowData: StudentRowData}
          ) => (
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
    <div>
      {globalErrorMessage && (
        <div className={style.alert}>{globalErrorMessage}</div>
      )}
      <div className={style.interactionsElement}>
        <SectionAccessToggle sectionId={sectionId} />
      </div>
      <div className={style.interactionsElement}>
        {aiTutorEnabledForSection ? (
          isLoading ? (
            <Spinner />
          ) : (
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
          )
        ) : null}
      </div>
    </div>
  );
};

export default AccessControls;
