import React, {Component, PropTypes} from 'react';
import {Table, sort} from 'reactabular';
import wrappedSortable from '../tables/wrapped_sortable';
import orderBy from 'lodash/orderBy';
import PasswordReset from './PasswordReset';
import ShowSecret from './ShowSecret';
import {SectionLoginType} from '@cdo/apps/util/sharedConstants';
import i18n from "@cdo/locale";
import {tableLayoutStyles, sortableOptions} from "../tables/tableConstants";
import QuickAction from "../tables/QuickAction";
import QuickActionsCell from "../tables/QuickActionsCell";

export const studentSectionDataPropType = PropTypes.shape({
  id: PropTypes.number.isRequired,
  name: PropTypes.string,
  username: PropTypes.string,
  userType: PropTypes.string,
  age: PropTypes.number,
  gender: PropTypes.string,
  secretWords: PropTypes.string,
  secretPictureName: PropTypes.string,
  secretPicturePath: PropTypes.string,
  sectionId: PropTypes.number,
});

const GENDERS = {
  m: i18n.genderMale(),
  f: i18n.genderFemale()
};

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
  const url = `/teacher-dashboard#/sections/${rowData.sectionId}/student/${rowData.id}`;
  return (<div>
    <a style={tableLayoutStyles.link} href={url} target="_blank">{name}</a>
    {rowData.loginType === SectionLoginType.email &&
      <p>{i18n.usernameLabel() + rowData.username}</p>
    }
  </div>);
};

const ageFormatter = (age, {rowData}) => {
  return (<div>
    {age}
  </div>);
};

const genderFormatter = (gender, {rowData}) => {
  return (<div>
    {GENDERS[gender]}
  </div>);
};

const passwordFormatter = (loginType, {rowData}) => {
  return (
    <div>
      {rowData.loginType === SectionLoginType.email &&
        <PasswordReset
          resetAction={()=>{}}
          initialIsResetting={false}
        />
      }
      {(rowData.loginType === SectionLoginType.word || rowData.loginType === SectionLoginType.picture) &&
        <ShowSecret
          resetSecret={()=>{}}
          initialIsShowing={false}
          secretWord={rowData.secretWords}
          secretPicture={rowData.secretPicturePath}
          loginType={rowData.loginType}
        />
      }
    </div>
  );
};

const actionsFormatter = function (actions, {rowData}) {
  return (
    <QuickActionsCell>
      <QuickAction
        text={"Edit"}
        action={()=>{}}
      />
      <QuickAction
        text={"Remove student"}
        action={()=>{}}
        hasLineAbove={true}
        isDelete={true}
      />
    </QuickActionsCell>
  );
};

class ManageStudentsTable extends Component {
  static propTypes = {
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
          }},
          transforms: [sortable],
        },
        cell: {
          format: nameFormatter,
          props: {
            style: {
            ...tableLayoutStyles.cell,
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
          }},
          transforms: [sortable],
        },
        cell: {
          format: ageFormatter,
          props: {
            style: {
            ...tableLayoutStyles.cell,
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
          }},
          transforms: [sortable],
        },
        cell: {
          format: genderFormatter,
          props: {
            style: {
            ...tableLayoutStyles.cell,
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
          }},
        },
        cell: {
          format: passwordFormatter,
          props: {
            style: {
            ...tableLayoutStyles.cell,
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
          }},
        },
        cell: {
          format: actionsFormatter,
          props: {
            style: {
            ...tableLayoutStyles.cell,
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

export default ManageStudentsTable;
