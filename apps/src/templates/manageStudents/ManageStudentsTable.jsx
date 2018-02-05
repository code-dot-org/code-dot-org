import React, {Component, PropTypes} from 'react';
import {Table, sort} from 'reactabular';
import wrappedSortable from '../tables/wrapped_sortable';
import orderBy from 'lodash/orderBy';
import PasswordReset from './PasswordReset';
import ShowSecret from './ShowSecret';
import {SectionLoginType} from '@cdo/apps/util/sharedConstants';
import i18n from "@cdo/locale";
import {tableLayoutStyles, sortableOptions} from "../tables/tableConstants";
import ManageStudentsNameCell from './ManageStudentsNameCell';
import ManageStudentsAgeCell from './ManageStudentsAgeCell';
import ManageStudentsGenderCell from './ManageStudentsGenderCell';
import ManageStudentsActionsCell from './ManageStudentsActionsCell';
import {convertStudentDataToArray} from './manageStudentsRedux';
import { connect } from 'react-redux';

export const studentSectionDataPropType = PropTypes.shape({
  id: PropTypes.number.isRequired,
  name: PropTypes.string,
  username: PropTypes.string,
  age: PropTypes.number,
  gender: PropTypes.string,
  secretWords: PropTypes.string,
  secretPicturePath: PropTypes.string,
  sectionId: PropTypes.number,
  loginType: PropTypes.string,
});

/** @enum {number} */
export const COLUMNS = {
  NAME: 0,
  AGE: 1,
  GENDER: 2,
  PASSWORD: 3,
  ACTIONS: 4,
};

// Cell formatters.
const nameFormatter = (name, {rowData}) => {
  return (
    <ManageStudentsNameCell
      id={rowData.id}
      sectionId={rowData.sectionId}
      name={name}
      loginType={rowData.loginType}
      username={rowData.username}
      isEditing={rowData.isEditing}
    />
  );
};

const ageFormatter = (age, {rowData}) => {
  return (
    <ManageStudentsAgeCell
      age={age}
      id={rowData.id}
      isEditing={rowData.isEditing}
    />
  );
};

const genderFormatter = (gender, {rowData}) => {
  return (
    <ManageStudentsGenderCell
      gender={gender}
      id={rowData.id}
      isEditing={rowData.isEditing}
    />
  );
};

const passwordFormatter = (loginType, {rowData}) => {
  return (
    <div>
      {!rowData.isEditing &&
        <div>
          {rowData.loginType === SectionLoginType.email &&
            <PasswordReset
              initialIsResetting={false}
              id={rowData.id}
            />
          }
          {(rowData.loginType === SectionLoginType.word || rowData.loginType === SectionLoginType.picture) &&
            <ShowSecret
              initialIsShowing={false}
              secretWord={rowData.secretWords}
              secretPicture={rowData.secretPicturePath}
              loginType={rowData.loginType}
              id={rowData.id}
            />
          }
        </div>
      }
      {rowData.isEditing &&
        <div>
          Auto-generated
        </div>
      }
    </div>
  );
};

const actionsFormatter = function (actions, {rowData}) {
  return (
    <ManageStudentsActionsCell
      id={rowData.id}
      sectionId={rowData.sectionId}
      isEditing={rowData.isEditing}
    />
  );
};

class ManageStudentsTable extends Component {
  static propTypes = {
    // Provided by redux
    studentData: PropTypes.arrayOf(studentSectionDataPropType),
    loginType: PropTypes.string,
  };

  state = {
    [COLUMNS.NAME]: {
      direction: 'desc',
      position: 0
    }
  };

  getSortingColumns = () => {
    return this.state.sortingColumns || {};
  };

  // The user requested a new sorting column. Adjust the state accordingly.
  onSort = (selectedColumn) => {
    this.setState({
      sortingColumns: sort.byColumn({
        sortingColumns: this.state.sortingColumns,
        // Custom sortingOrder removes 'no-sort' from the cycle
        sortingOrder: {
          FIRST: 'asc',
          asc: 'desc',
          desc: 'asc'
        },
        selectedColumn
      })
    });
  };

  getColumns = (sortable) => {
    const {loginType} = this.props;
    const passwordLabel = loginType === SectionLoginType.email ? i18n.password() : i18n.secret();
    const dataColumns = [
      {
        property: 'name',
        header: {
          label: i18n.name(),
          props: {
            style: {
            ...tableLayoutStyles.headerCell,
            width: 300
          }},
          transforms: [sortable],
        },
        cell: {
          format: nameFormatter,
          props: {
            style: {
            ...tableLayoutStyles.cell,
            width: 300
          }}
        }
      },
      {
        property: 'age',
        header: {
          label: i18n.age(),
          props: {
            style: {
            ...tableLayoutStyles.headerCell,
            width: 100,
          }},
          transforms: [sortable],
        },
        cell: {
          format: ageFormatter,
          props: {
            style: {
            ...tableLayoutStyles.cell,
            width: 100,
          }}
        }
      },
      {
        property: 'gender',
        header: {
          label: i18n.gender(),
          props: {
            style: {
            ...tableLayoutStyles.headerCell,
            width: 150,
          }},
          transforms: [sortable],
        },
        cell: {
          format: genderFormatter,
          props: {
            style: {
            ...tableLayoutStyles.cell,
            width: 150,
          }}
        }
      },
    ];
    const controlsColumns = [
      {
        property: 'password',
        header: {
          label: passwordLabel,
          props: {
            style: {
            ...tableLayoutStyles.headerCell,
            ...tableLayoutStyles.unsortableHeader,
            width: 200,
          }},
        },
        cell: {
          format: passwordFormatter,
          props: {
            style: {
            ...tableLayoutStyles.cell,
            width: 200,
          }}
        }
      },
      {
        property: 'actions',
        header: {
          label: i18n.actions(),
          props: {
            style: {
            ...tableLayoutStyles.headerCell,
            ...tableLayoutStyles.unsortableHeader,
            width: 200,
          }},
        },
        cell: {
          format: actionsFormatter,
          props: {
            style: {
            ...tableLayoutStyles.cell,
            width: 200,
          }}
        }
      },
    ];

    if (loginType === SectionLoginType.word || loginType === SectionLoginType.picture || loginType === SectionLoginType.email) {
      return dataColumns.concat(controlsColumns);
    } else {
      return dataColumns;
    }
  };

  render() {
    // Define a sorting transform that can be applied to each column
    const sortable = wrappedSortable(this.getSortingColumns, this.onSort, sortableOptions);
    const columns = this.getColumns(sortable);
    const sortingColumns = this.getSortingColumns();

    const sortedRows = sort.sorter({
      columns,
      sortingColumns,
      sort: orderBy,
    })(this.props.studentData);

    return (
      <Table.Provider
        columns={columns}
        style={tableLayoutStyles.table}
      >
        <Table.Header />
        <Table.Body rows={sortedRows} rowKey="name" />
      </Table.Provider>
    );
  }
}

export const UnconnectedManageStudentsTable = ManageStudentsTable;

export default connect(state => ({
  loginType: state.manageStudents.loginType,
  studentData: convertStudentDataToArray(state.manageStudents.studentData),
}))(ManageStudentsTable);
