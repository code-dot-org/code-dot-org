import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import color from '@cdo/apps/util/color';
import {Table, sort} from 'reactabular';
import i18n from '@cdo/locale';
import wrappedSortable from '../tables/wrapped_sortable';
import orderBy from 'lodash/orderBy';
import {getSectionRows} from './teacherSectionsRedux';
import {sortableSectionShape, OAuthSectionTypes} from './shapes';
import {tableLayoutStyles, sortableOptions} from '../tables/tableConstants';
import {teacherDashboardUrl} from '@cdo/apps/templates/teacherDashboard/urlHelpers';
import SectionActionDropdown from './SectionActionDropdown';
import Button from '@cdo/apps/templates/Button';
import {stringifyQueryParams} from '../../utils';

/** @enum {number} */
export const COLUMNS = {
  ID: 0,
  SECTION_NAME: 1,
  GRADE: 2,
  COURSE: 3,
  STUDENTS: 4,
  LOGIN_INFO: 5,
  EDIT_DELETE: 6
};

const styles = {
  currentUnit: {
    marginTop: 10
  },
  //Hides a column so that we can sort by a value not displayed
  hiddenCol: {
    width: 0,
    padding: 0,
    border: 0
  },
  //Assigned to a column with the hidden column to the left
  leftHiddenCol: {
    borderLeft: 0
  },
  unsortableHeader: tableLayoutStyles.unsortableHeader,
  colButton: {
    paddingTop: 20,
    paddingLeft: 20,
    paddingBottom: 20,
    width: 40
  },
  sectionCol: {
    paddingLeft: 20
  },
  sectionCodeNone: {
    color: color.light_gray,
    fontSize: 16
  }
};

// Cell formatters for sortable OwnedSectionsTable.
export const sectionLinkFormatter = function(name, {rowData}) {
  return (
    <a style={tableLayoutStyles.link} href={teacherDashboardUrl(rowData.id)}>
      {rowData.name}
    </a>
  );
};

export const courseLinkFormatter = function(course, {rowData}) {
  const {assignmentNames, assignmentPaths} = rowData;
  return (
    <div>
      <a
        href={`${rowData.assignmentPaths[0]}${stringifyQueryParams({
          section_id: rowData.id
        })}`}
        style={tableLayoutStyles.link}
      >
        {rowData.assignmentNames[0]}
      </a>
      {assignmentPaths.length > 1 && (
        <div style={styles.currentUnit}>
          <div>{i18n.currentUnit()}</div>
          <a
            href={`${rowData.assignmentPaths[1]}${stringifyQueryParams({
              section_id: rowData.id
            })}`}
            style={tableLayoutStyles.link}
          >
            {assignmentNames[1]}
          </a>
        </div>
      )}
      {assignmentPaths.length < 1 && (
        <Button
          text={i18n.coursesCardAction()}
          href={'/courses'}
          color={Button.ButtonColor.gray}
        />
      )}
    </div>
  );
};

export const gradeFormatter = function(grade, {rowData}) {
  return <div>{rowData.grade}</div>;
};

export const loginInfoFormatter = function(loginType, {rowData}) {
  let sectionCode = '';

  // For managed logins, just show the provider name rather than the login code.
  if (rowData.loginType === OAuthSectionTypes.clever) {
    sectionCode = i18n.loginTypeClever();
  } else if (rowData.loginType === OAuthSectionTypes.google_classroom) {
    sectionCode = i18n.loginTypeGoogleClassroom();
  } else {
    sectionCode = rowData.code;
  }
  return (
    <a
      style={tableLayoutStyles.link}
      href={teacherDashboardUrl(rowData.id, '/login_info')}
    >
      {sectionCode}
    </a>
  );
};

export const studentsFormatter = function(studentCount, {rowData}) {
  const manageStudentsUrl = teacherDashboardUrl(rowData.id, '/manage_students');
  const studentHtml =
    rowData.studentCount <= 0 ? (
      <Button
        text={i18n.addStudents()}
        href={manageStudentsUrl}
        color={Button.ButtonColor.gray}
      />
    ) : (
      <a style={tableLayoutStyles.link} href={manageStudentsUrl}>
        {rowData.studentCount}
      </a>
    );
  return studentHtml;
};

//Displays nothing for hidden column
const hiddenFormatter = function(id) {
  return null;
};

/**
 * This is a component that shows information about the sections that a teacher
 * owns, and allows for editing, deleting and sorting them.
 * It shows some of the same information as the SectionsAsStudentTable used on the teacher
 * homepage. However, for historical reasons it unfortunately has a somewhat
 * different set/shape of input data. This component gets its data from
 * section_api_helpers in pegasus via an AJAX call, whereas that component gets
 * its data from section.summarize on page load.
 * Both ultimately source data from the dashboard db.
 * Long term it would be ideal if section_api_helpers went away and both components
 * used dashboard.
 */
class OwnedSectionsTable extends Component {
  static propTypes = {
    sectionIds: PropTypes.arrayOf(PropTypes.number).isRequired,
    onEdit: PropTypes.func.isRequired,

    //Provided by redux
    sectionRows: PropTypes.arrayOf(sortableSectionShape).isRequired
  };

  state = {
    sortingColumns: {
      [COLUMNS.ID]: {
        direction: 'desc',
        position: 0
      }
    }
  };

  actionCellFormatter = (temp, {rowData}) => {
    return (
      <SectionActionDropdown
        sectionData={rowData}
        handleEdit={this.props.onEdit}
      />
    );
  };

  // The user requested a new sorting column. Adjust the state accordingly.
  onSort = selectedColumn => {
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

  getSortingColumns = () => {
    return this.state.sortingColumns || {};
  };

  getColumns = sortable => {
    const colStyle = {...tableLayoutStyles.cell, ...styles.sectionCol};
    return [
      {
        //displays nothing, but used as initial sort
        property: 'id',
        header: {
          props: {style: styles.hiddenCol}
        },
        cell: {
          format: hiddenFormatter,
          props: {style: styles.hiddenCol}
        }
      },

      {
        property: 'name',
        header: {
          label: i18n.section(),
          props: {style: tableLayoutStyles.headerCell},
          transforms: [sortable]
        },
        cell: {
          format: sectionLinkFormatter,
          props: {style: {...colStyle, ...styles.leftHiddenCol}}
        }
      },
      {
        property: 'grade',
        header: {
          label: i18n.grade(),
          props: {style: tableLayoutStyles.headerCell},
          transforms: [sortable]
        },
        cell: {
          format: gradeFormatter,
          props: {style: colStyle}
        }
      },
      {
        property: 'course',
        header: {
          label: i18n.course(),
          props: {
            style: {...tableLayoutStyles.headerCell, ...styles.unsortableHeader}
          }
        },
        cell: {
          format: courseLinkFormatter,
          props: {style: colStyle}
        }
      },
      {
        property: 'studentCount',
        header: {
          label: i18n.students(),
          props: {style: tableLayoutStyles.headerCell},
          transforms: [sortable]
        },
        cell: {
          format: studentsFormatter,
          props: {style: colStyle}
        }
      },
      {
        property: 'loginType',
        header: {
          label: i18n.loginInfo(),
          props: {
            style: {...tableLayoutStyles.headerCell, ...styles.unsortableHeader}
          }
        },
        cell: {
          format: loginInfoFormatter,
          props: {style: colStyle}
        }
      },
      {
        property: 'actions',
        header: {
          props: {style: tableLayoutStyles.headerCell}
        },
        cell: {
          format: this.actionCellFormatter,
          props: {style: {...tableLayoutStyles.cell, ...styles.colButton}}
        }
      }
    ];
  };

  render() {
    const sortable = wrappedSortable(
      this.getSortingColumns,
      this.onSort,
      sortableOptions
    );
    const columns = this.getColumns(sortable);
    const sortingColumns = this.getSortingColumns();

    const sortedRows = sort.sorter({
      columns,
      sortingColumns,
      sort: orderBy
    })(this.props.sectionRows);

    return (
      <Table.Provider columns={columns} style={tableLayoutStyles.table}>
        <Table.Header />
        <Table.Body rows={sortedRows} rowKey="id" />
      </Table.Provider>
    );
  }
}

export const UnconnectedOwnedSectionsTable = OwnedSectionsTable;

export default connect((state, ownProps) => ({
  sectionRows: getSectionRows(state, ownProps.sectionIds)
}))(OwnedSectionsTable);
