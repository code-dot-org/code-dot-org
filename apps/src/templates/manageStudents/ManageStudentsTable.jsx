import React, {Component, PropTypes} from 'react';
import color from "../../util/color";
import {Table, sort} from 'reactabular';
import wrappedSortable from '../tables/wrapped_sortable';
import orderBy from 'lodash/orderBy';
import PasswordReset from './PasswordReset';
import ShowSecret from './ShowSecret';
import {SectionLoginType} from '@cdo/apps/util/sharedConstants';
import i18n from "@cdo/locale";

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

export const styles = {
  table: {
    width: 970,
    borderRadius: 5,
    color: color.charcoal,
    backgroundColor: color.table_light_row
  },
  cell: {
    border: '1px solid',
    borderColor: color.border_light_gray,
    padding: 10,
    fontSize: 14,
  },
  headerCell: {
    border: '1px solid',
    borderColor: color.border_light_gray,
    padding: 20,
    backgroundColor: color.lightest_gray,
    color: color.charcoal
  },
  cellFirst: {
    borderWidth: '1px 0px 1px 1px',
    borderColor: color.border_light_gray,
    padding: 15,
    width: 270
  },
  headerCellFirst: {
    borderWidth: '1px 0px 1px 1px',
    borderColor: color.border_light_gray,
    padding: 15
  },
  link: {
    color: color.teal,
    fontFamily: '"Gotham 5r", sans-serif',
    fontSize: 14,
    textDecoration: 'none'
  },
};

// Cell formatters.
const nameFormatter = (name, {rowData}) => {
  const url = `/teacher-dashboard#/sections/${rowData.sectionId}/student/${rowData.id}`;
  return (<div>
    <a style={styles.link} href={url} target="_blank">{name}</a>
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

const actionsFormatter = (actions, {rowData}) => {
  return (
    <div>Edit</div>
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
            ...styles.headerCell,
            ...styles.headerCellFirst
          }},
          transforms: [sortable],
        },
        cell: {
          format: nameFormatter,
          props: {
            style: {
            ...styles.cell,
            ...styles.cellFirst
          }}
        }
      },
      {
        property: 'age',
        header: {
          label: i18n.age(),
          props: {
            style: {
            ...styles.headerCell,
          }},
          transforms: [sortable],
        },
        cell: {
          format: ageFormatter,
          props: {
            style: {
            ...styles.cell,
          }}
        }
      },
      {
        property: 'gender',
        header: {
          label: i18n.gender(),
          props: {
            style: {
            ...styles.headerCell,
          }},
          transforms: [sortable],
        },
        cell: {
          format: genderFormatter,
          props: {
            style: {
            ...styles.cell,
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
            ...styles.headerCell,
          }},
        },
        cell: {
          format: passwordFormatter,
          props: {
            style: {
            ...styles.cell,
          }}
        }
      },
      {
        property: 'actions',
        header: {
          label: i18n.actions(),
          props: {
            style: {
            ...styles.headerCell,
          }},
        },
        cell: {
          format: actionsFormatter,
          props: {
            style: {
            ...styles.cell,
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
    const sortableOptions = {
      // Dim inactive sorting icons in the column headers
      default: {color: 'rgba(0, 0, 0, 0.2 )'}
    };

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
        style={styles.table}
      >
        <Table.Header />
        <Table.Body rows={sortedRows} rowKey="name" />
      </Table.Provider>
    );
  }
}

export default ManageStudentsTable;
