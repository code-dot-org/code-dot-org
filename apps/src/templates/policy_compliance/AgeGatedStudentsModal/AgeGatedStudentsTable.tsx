import React from 'react';
import {connect} from 'react-redux';
import * as Table from 'reactabular-table';

import {
  convertStudentDataToArray,
  filterAgeGatedStudents,
} from '@cdo/apps/templates/manageStudents/manageStudentsRedux';
import i18n from '@cdo/locale';

import ManageStudentsFamilyNameCell from '../../manageStudents/ManageStudentsFamilyNameCell';
import {tableLayoutStyles} from '../../tables/tableConstants';

import AgeGatedTableConsentStatusCell from './AgeGatedTableConsentStatusCell';

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
  studentData?: [];
}

const AgeGatedStudentsTable: React.FC<Props> = ({studentData}) => {
  const getColumns = () => {
    const columns = [
      nameColumn(),
      consentStatusColumn(),
      parentEmailedColumn(),
    ];

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

  const parentEmailedFormatter = (
    latestPermissionRequestSentAt: Date | null
  ) => (
    <div style={tableLayoutStyles.tableText}>
      {latestPermissionRequestSentAt ? i18n.yes() : i18n.no()}
    </div>
  );

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

  const parentEmailedColumn = () => ({
    property: 'latestPermissionRequestSentAt',
    header: {
      label: i18n.childAccountPolicy_parentEmailed(),
      props: {
        style: {
          ...tableLayoutStyles.headerCell,
        },
      },
    },
    cell: {
      formatters: [parentEmailedFormatter],
      props: {
        style: {
          ...tableLayoutStyles.cell,
        },
      },
    },
  });

  const columns = getColumns();
  return (
    <div>
      {studentData && studentData.length !== 0 && (
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

export default connect(
  (state: ReduxState) => ({
    studentData: filterAgeGatedStudents(
      convertStudentDataToArray(state.manageStudents.studentData)
    ),
  }),
  {}
)(AgeGatedStudentsTable);
