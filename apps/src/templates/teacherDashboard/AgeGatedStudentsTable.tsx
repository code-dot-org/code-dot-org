import React from 'react';
import {connect} from 'react-redux';
// @ts-expect-error Import error for reactabular-table in typescript
import * as Table from 'reactabular-table';

import {
  convertStudentDataToArray,
  filterAgeGatedStudents,
} from '@cdo/apps/templates/manageStudents/manageStudentsRedux';
import i18n from '@cdo/locale';

import {AgeGatedTableConsentStatusCell} from '../manageStudents/AgeGatedTableConsentStatusCell';
import ManageStudentsFamilyNameCell from '../manageStudents/ManageStudentsFamilyNameCell';
import {tableLayoutStyles} from '../tables/tableConstants';

interface ReduxState {
  manageStudents: {
    studentData?: object;
  };
}

interface RowData {
  rowData: {
    id: number;
    familyName: string;
  };
}

interface Props {
  studentData?: object;
}

const AgeGatedStudentsTable: React.FC<Props> = ({studentData}) => {
  const getColumns = () => {
    const columns = [nameColumn(), consentStatusColumn()];

    return columns;
  };

  const nameFormatter = (name: string, {rowData}: RowData) => {
    const familyName = rowData.familyName ? rowData.familyName : '';
    return (
      <ManageStudentsFamilyNameCell
        id={rowData.id}
        familyName={`${name} ${familyName}`}
      />
    );
  };

  const consentStatusFormatter = (
    childAccountComplianceState: string,
    {rowData}: RowData
  ) => {
    return (
      <AgeGatedTableConsentStatusCell
        id={rowData.id}
        consentStatus={childAccountComplianceState}
      />
    );
  };

  const nameColumn = () => {
    return {
      property: 'name',
      header: {
        label: i18n.loginExportHeader_studentName(),
        props: {
          style: {
            ...tableLayoutStyles.headerCell,
          },
        },
      },
      cell: {
        formatters: [nameFormatter],
        props: {
          style: {
            ...tableLayoutStyles.cell,
          },
        },
      },
    };
  };

  const consentStatusColumn = () => {
    return {
      property: 'childAccountComplianceState',
      header: {
        label: i18n.childAccountPolicy_consentStatus(),
        props: {
          style: {
            ...tableLayoutStyles.headerCell,
          },
        },
      },
      cell: {
        formatters: [consentStatusFormatter],
        props: {
          style: {
            ...tableLayoutStyles.cell,
          },
        },
      },
    };
  };

  const columns = getColumns();
  return (
    <div>
      {Object.keys(studentData).length !== 0 && (
        <Table.Provider
          columns={columns}
          style={tableLayoutStyles.table}
          data-testid="uitest-age-gated-students-table"
        >
          <Table.Header />
          <Table.Body rows={studentData} rowKey="id" />
        </Table.Provider>
      )}
    </div>
  );
};

export const UnconnectedAgeGatedStudentsTable = AgeGatedStudentsTable;

export default connect(
  (state: ReduxState) => ({
    studentData: filterAgeGatedStudents(
      convertStudentDataToArray(state.manageStudents.studentData)
    ),
  }),
  {}
)(AgeGatedStudentsTable);
