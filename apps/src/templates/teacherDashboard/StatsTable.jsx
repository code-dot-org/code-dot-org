import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import * as Table from 'reactabular-table';
import * as sort from 'sortabular';
import wrappedSortable from '../tables/wrapped_sortable';
import {tableLayoutStyles, sortableOptions} from '../tables/tableConstants';
import orderBy from 'lodash/orderBy';
import {getSelectedScriptName} from '@cdo/apps/redux/unitSelectionRedux';
import {scriptUrlForStudent} from '@cdo/apps/templates/teacherDashboard/urlHelpers';

class StatsTable extends Component {
  static propTypes = {
    section: PropTypes.shape({
      id: PropTypes.number,
      students: PropTypes.array
    }).isRequired,
    studentsCompletedLevelCount: PropTypes.object,

    // Provided by redux.
    scriptName: PropTypes.string
  };

  state = {};

  studentsWithCompletedLevelCount = () => {
    const {section, studentsCompletedLevelCount} = this.props;
    return (section.students || []).map(student => ({
      ...student,
      completed_levels_count: studentsCompletedLevelCount[student.id] || 0
    }));
  };

  nameFormatter = (name, {rowData}) => {
    const {section, scriptName} = this.props;
    const studentUrl = scriptUrlForStudent(section.id, scriptName, rowData.id);

    if (studentUrl) {
      return (
        <a
          className="uitest-name-cell"
          style={tableLayoutStyles.link}
          href={studentUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          {name}
        </a>
      );
    } else {
      return <span className="uitest-name-cell">{name}</span>;
    }
  };

  getSortingColumns = () => {
    return this.state.sortingColumns || {};
  };

  getColumns = sortable => {
    return [
      {
        property: 'name',
        header: {
          label: i18n.name(),
          props: {
            className: 'uitest-name-header',
            style: {
              ...tableLayoutStyles.headerCell
            }
          },
          transforms: [sortable]
        },
        cell: {
          formatters: [this.nameFormatter],
          props: {
            style: {
              ...tableLayoutStyles.cell
            }
          }
        }
      },
      {
        property: 'completed_levels_count',
        header: {
          label: i18n.completedLevels(),
          props: {
            style: {
              ...tableLayoutStyles.headerCell,
              ...styles.rightAlignText
            }
          },
          transforms: [sortable]
        },
        cell: {
          props: {
            style: {
              ...tableLayoutStyles.cell,
              ...styles.rightAlignText
            }
          }
        }
      },
      {
        property: 'total_lines',
        header: {
          label: i18n.linesOfCode(),
          props: {
            style: {
              ...tableLayoutStyles.headerCell,
              ...styles.rightAlignText
            }
          },
          transforms: [sortable]
        },
        cell: {
          props: {
            style: {
              ...tableLayoutStyles.cell,
              ...styles.rightAlignText
            }
          }
        }
      }
    ];
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

  render() {
    // Define a sorting transform that can be applied to each column
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
    })(this.studentsWithCompletedLevelCount());

    return (
      <Table.Provider
        columns={columns}
        style={styles.table}
        id="uitest-stats-table"
      >
        <Table.Header />
        <Table.Body rows={sortedRows} rowKey="id" />
      </Table.Provider>
    );
  }
}

const styles = {
  table: {
    width: '100%'
  },
  rightAlignText: {
    textAlign: 'right'
  }
};

export const UnconnectedStatsTable = StatsTable;
export default connect(state => ({
  scriptName: getSelectedScriptName(state)
}))(StatsTable);
