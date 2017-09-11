import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import color from "@cdo/apps/util/color";
import {Table, sort} from 'reactabular';
import i18n from '@cdo/locale';
import { styles as tableStyles } from '@cdo/apps/templates/studioHomepages/SectionsTable';
import styleConstants from '@cdo/apps/styleConstants';
import wrappedSortable from '../tables/wrapped_sortable';
import orderBy from 'lodash/orderBy';
import {getSectionRows} from './teacherSectionsRedux';
import {sortableSectionShape} from "./shapes";
import {styles as reactTableStyles} from '../projects/PersonalProjectsTable';
import {pegasus} from "../../lib/util/urlHelpers";
import SectionTableButtonCell from "./SectionTableButtonCell";
import ReactTooltip from 'react-tooltip';

/** @enum {number} */
export const COLUMNS = {
  ID: 0,
  SECTION_NAME: 1,
  GRADE: 2,
  COURSE: 3,
  STUDENTS: 4,
  LOGIN_INFO: 5,
  EDIT_DELETE: 6,
};

const styles = {
  table: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: color.border_gray,
    width: styleConstants['content-width'],
    backgroundColor: color.table_light_row
  },
  headerRow: tableStyles.headerRow,
  col: tableStyles.col,
  link: tableStyles.link,
  headerRowPadding: {
    paddingTop: 20,
    paddingBottom: 20,
    color: color.charcoal,
  },
  cell: reactTableStyles.cell,
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
    borderLeft: 0,
  },
  unsortableHeader: {
    paddingLeft: 25,
  },
  colButton: {
    paddingTop: 20,
    paddingLeft: 20,
    paddingBottom: 20,
  },
  sectionCol: {
    paddingLeft: 20,
  },
  sectionCodeNone: {
    color: color.light_gray,
    fontSize: 16,
  },
};

// Cell formatters for sortable SectionTable.
export const sectionLinkFormatter = function (name, {rowData}) {
  const pegasusUrl = pegasus('/teacher-dashboard#/sections/' + rowData.id);
  return <a style={styles.link} href={pegasusUrl}>{rowData.name}</a>;
};

export const courseLinkFormatter = function (course, {rowData}) {
  const { assignmentNames, assignmentPaths } = rowData;
  return (
    <div>
      <a
        href={rowData.assignmentPaths[0]}
        style={styles.link}
      >
        {rowData.assignmentNames[0]}
      </a>
      {assignmentPaths.length > 1 && (
        <div style={styles.currentUnit}>
          <div>{i18n.currentUnit()}</div>
          <a
            href={assignmentPaths[1]}
            style={styles.link}
          >
            {assignmentNames[1]}
          </a>
        </div>
      )}
    </div>
  );
};

export const gradeFormatter = function (grade, {rowData}) {
  return <div>{rowData.grade}</div>;
};

export const loginInfoFormatter = function (loginType, {rowData}) {
  let sectionCode = '';
  if (rowData.providerManaged) {
    sectionCode = (
      <div data-tip={i18n.providerManagedSection({provider: rowData.loginType})}>
        {i18n.none()}
        &nbsp;
        <i
          className="fa fa-question-circle"
          style={styles.sectionCodeNone}
        />
        <ReactTooltip
          role="tooltip"
          effect="solid"
        />
      </div>
    );
  } else {
    sectionCode = rowData.code;
  }
  return <div>{sectionCode}</div>;
};

export const studentsFormatter = function (studentCount, {rowData}) {
  const pegasusUrl = pegasus('/teacher-dashboard#/sections/' + rowData.id + "/manage");
  const studentText = rowData.studentCount <= 0 ? i18n.addStudents() : rowData.studentCount;
  return <a style={styles.link} href={pegasusUrl}>{studentText}</a>;
};

//Displays nothing for hidden column
const hiddenFormatter = function (id) {
  return null;
};

/**
 * This is a component that shows information about the sections that a teacher
 * owns, and allows for editing, deleting and sorting them.
 * It shows some of the same information as the SectionsTable used on the teacher
 * homepage. However, for historical reasons it unfortunately has a somewhat
 * different set/shape of input data. This component gets its data from
 * section_api_helpers in pegasus via an AJAX call, whereas that component gets
 * its data from section.summarize on page load.
 * Both ultimately source data from the dashboard db.
 * Long term it would be ideal if section_api_helpers went away and both components
 * used dashboard.
 */
class SectionTable extends Component {
  static propTypes = {
    sectionIds: PropTypes.arrayOf(PropTypes.number).isRequired,
    onEdit: PropTypes.func,

    //Provided by redux
    sectionRows: PropTypes.arrayOf(sortableSectionShape).isRequired,
  };

  state = {
    sortingColumns: {
      [COLUMNS.ID]: {
        direction: 'asc',
        position: 0
      }
    }
  };

  actionCellFormatter = (temp, {rowData}) => {
    return <SectionTableButtonCell sectionData={rowData} handleEdit={this.props.onEdit}/>;
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

  getSortingColumns = () => {
    return this.state.sortingColumns || {};
  };

  getColumns = (sortable) => {
    const colHeaderStyle = {...styles.headerRow, ...styles.headerRowPadding};
    const colStyle = {...styles.cell, ...styles.sectionCol};

    return [
      {
        //displays nothing, but used as initial sort
        property: 'id',
        header:{
          props: {style: styles.hiddenCol}
        },
        cell: {
          format: hiddenFormatter,
          props: {style: styles.hiddenCol}
        }},

      {
        property: 'name',
        header: {
          label: i18n.section(),
          props: {style: colHeaderStyle},
          transforms: [sortable],
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
          props: {style: colHeaderStyle},
          transforms: [sortable],
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
          props: {style: {...colHeaderStyle, ...styles.unsortableHeader}},
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
          props: {style: colHeaderStyle},
          transforms: [sortable],
        },
        cell: {
          format: studentsFormatter,
          props: {style: colStyle}
        }
      },
      {
        property: 'loginType',
        header: {
          label: i18n.sectionCode(),
          props:{style: colHeaderStyle},
        },
        cell: {
          format: loginInfoFormatter,
          props: {style: colStyle}
        }
      },
      {
        property: 'actions',
        header: {
          props:{style: colHeaderStyle},
        },
        cell: {
          format: this.actionCellFormatter,
          props: {style: {...styles.cell, ...styles.colButton}}
        }
      }
    ];
  };

  render() {
    const sortableOptions = {
      // Dim inactive sorting icons in the column headers
      default: {color: 'rgba(148, 156, 162, 0.8 )'}
    };

    const sortable = wrappedSortable(this.getSortingColumns, this.onSort, sortableOptions);
    const columns = this.getColumns(sortable);
    const sortingColumns = this.getSortingColumns();

    const sortedRows = sort.sorter({
      columns,
      sortingColumns,
      sort: orderBy,
    })(this.props.sectionRows);

    return (
      <Table.Provider
        columns={columns}
        style={styles.table}
      >
        <Table.Header />
        <Table.Body rows={sortedRows} rowKey="id" />
      </Table.Provider>
    );
  }
}

export const UnconnectedSectionTable = SectionTable;

export default connect((state, ownProps) => ({
  sectionRows: getSectionRows(state, ownProps.sectionIds)
}))(SectionTable);
