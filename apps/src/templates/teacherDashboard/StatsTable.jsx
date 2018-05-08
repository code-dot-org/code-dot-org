import React, {Component, PropTypes} from 'react';
import i18n from "@cdo/locale";
import {Table, sort} from 'reactabular';
import wrappedSortable from '../tables/wrapped_sortable';
import {tableLayoutStyles, sortableOptions} from "../tables/tableConstants";
import orderBy from 'lodash/orderBy';

const styles = {
  table: {
    width: '100%'
  },
  rightAlignText: {
    textAlign: 'right'
  }
};

class StatsTable extends Component {
  static propTypes = {
    section: PropTypes.shape({
      id: PropTypes.number,
      students: PropTypes.array
    }),
    studentsCompletedLevelCount: PropTypes.object
  };

  state = {};

  studentsWithCompletedLevelCount = () => {
    const {section, studentsCompletedLevelCount} = this.props;
    return section.students.map(student => ({
      ...student,
      completed_levels_count: studentsCompletedLevelCount[student.id] || 0
    }));
  };

  nameFormatter = (name, {rowData}) => {
    const sectionId = this.props.section.id;
    return (
      <a
        className="uitest-name-cell"
        style={tableLayoutStyles.link}
        href={`/teacher-dashboard#/sections/${sectionId}/student/${rowData.id}`}
        target="_blank"
      >
        {name}
      </a>
    );
  };

  getSortingColumns = () => {
    return this.state.sortingColumns || {};
  };

  getColumns = (sortable) => {
    return [
      {
        property: 'name',
        header: {
          label: i18n.name(),
          props: {
            className: 'uitest-name-header',
            style: {
              ...tableLayoutStyles.headerCell
          }},
          transforms: [sortable]
        },
        cell: {
          format: this.nameFormatter,
          props: {
            style: {
              ...tableLayoutStyles.cell
          }}
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
          }}
        },
        cell: {
          props: {
            style: {
              ...tableLayoutStyles.cell,
              ...styles.rightAlignText
          }}
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
          }}
        },
        cell: {
          props: {
            style: {
              ...tableLayoutStyles.cell,
              ...styles.rightAlignText
          }}
        }
      }
    ];
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

  render() {
    // Define a sorting transform that can be applied to each column
    const sortable = wrappedSortable(this.getSortingColumns, this.onSort, sortableOptions);
    const columns = this.getColumns(sortable);
    const sortingColumns = this.getSortingColumns();

    const sortedRows = sort.sorter({
      columns,
      sortingColumns,
      sort: orderBy,
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

export default StatsTable;
