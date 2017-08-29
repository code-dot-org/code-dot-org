import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import color from "@cdo/apps/util/color";
import {Table, sort} from 'reactabular';
import i18n from '@cdo/locale';
import ReactTooltip from 'react-tooltip';
import { styles as tableStyles } from '@cdo/apps/templates/studioHomepages/SectionsTable';
import styleConstants from '@cdo/apps/styleConstants';
import wrappedSortable from '../tables/wrapped_sortable';
import orderBy from 'lodash/orderBy';
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';
import {getSectionRows} from './teacherSectionsRedux';
import { SectionLoginType } from '@cdo/apps/util/sharedConstants';

/** @enum {number} */
export const COLUMNS = {
  SECTION_NAME: 0,
  GRADE: 1,
  COURSE: 2,
  STUDENTS: 3,
  LOGIN_INFO: 4,
  EDIT_DELETE: 5,
};

const styles = {
  table: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: color.border_gray,
    width: styleConstants['content-width'],
  },
  headerRow: tableStyles.headerRow,
  col: tableStyles.col,
  colText: tableStyles.colText,
  link: {
    color: color.white
  },
  headerRowPadding: {
    paddingTop: 20,
    paddingBottom: 20,
  }
};

export const sectionDataPropType = PropTypes.shape({
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  loginType: PropTypes.oneOf(Object.keys(SectionLoginType)).isRequired,
  stageExtras: PropTypes.bool.isRequired,
  pairingAllowed: PropTypes.bool.isRequired,
  studentCount: PropTypes.number.isRequired,
  code: PropTypes.string.isRequired,
  courseId: PropTypes.number,
  scriptId: PropTypes.number,
  grade: PropTypes.string,
  providerManaged: PropTypes.bool.isRequired,
});

const ProviderManagedSectionCode = ({provider}) => (
  <div data-tip={i18n.providerManagedSection({provider})}>
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
ProviderManagedSectionCode.propTypes = {
  provider: PropTypes.string.isRequired,
};

// Cell formatters.
const sectionLinkFormatter = function (name, {rowData}) {
  const pegasusUrl = pegasus('/teacher-dashboard#/sections/' + rowData.id);
  return <a style={styles.colText} href={pegasusUrl} target="_blank">{rowData.name}</a>;
};

const courseLinkFormatter = function (course, {rowData}) {
  const url = '/s/';
  return <a style={styles.colText} href={url} target="_blank">{rowData.courseId} {rowData.scriptId}</a>;
};

const gradeFormatter = function (grade) {
  return <p>{grade}</p>;
};

const loginInfoFormatter = function (loginType, {rowData}) {
  let sectionCode = '';
  if (rowData.providerManaged) {
    sectionCode = <ProviderManagedSectionCode provider={rowData.loginType}/>;
  } else {
    sectionCode = rowData.code;
  }
  return <div>{sectionCode}</div>;
};

const studentsFormatter = function (studentCount, {rowData}) {
  return <p>{rowData.studentCount <= 0 ? i18n.addStudents() : rowData.studentCount}</p>;
};


/**
 * This is a component that shows information about the sections that a teacher
 * owns, and allows for editing them.
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
    sectionRows: PropTypes.arrayOf(sectionDataPropType).isRequired,
  };

  state = {
    sortingColumns: {
      [COLUMNS.SECTION_NAME]: {
        direction: 'desc',
        position: 0
      }
    }
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
    return [
      {
        property: 'sectionName',
        header: {
          label: i18n.sectionName(),
          props: {style: styles.headerCell},
        },
        cell: {
          format: sectionLinkFormatter,
          props: {style: styles.cell}
        }
      },
      {
        property: 'grade',
        header: {
          label: i18n.grade(),
          props: {style: styles.headerCell},
        },
        cell: {
          format: gradeFormatter,
          props: {style: styles.cell}
        }
      },
      {
        property: 'course',
        header: {
          label: i18n.course(),
          props: {style: styles.headerCell},
          transforms: [sortable],
        },
        cell: {
          format: courseLinkFormatter,
          props: {style: styles.cell}
        }
      },
      {
        property: 'students',
        header: {
          label: i18n.students(),
          props: {style: styles.headerCell},
          transforms: [sortable],
        },
        cell: {
          format: studentsFormatter,
          props: {style: styles.cell}
        }
      },
      {
        property: 'loginInfo',
        header: {
          label: i18n.loginInfo(),
          props: {style: styles.headerCell},
        },
        cell: {
          format: loginInfoFormatter,
          props: {style: styles.cell}
        }
      }
    ];
  };

  render() {
    const sortableOptions = {
      // Dim inactive sorting icons in the column headers
      default: {color: 'rgba(255, 255, 255, 0.2 )'}
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
        <Table.Body rows={sortedRows} rowKey="name" />
      </Table.Provider>
    );
  }
}

export const UnconnectedSectionTable = SectionTable;

export default connect(state => ({
  sectionIds: state.teacherSections.sectionIds,
  sectionRows: getSectionRows(state)
}))(SectionTable);
