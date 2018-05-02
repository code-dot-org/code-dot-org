import React, {Component, PropTypes} from 'react';
import i18n from "@cdo/locale";
import {Table, sort} from 'reactabular';
import wrappedSortable from '../tables/wrapped_sortable';
import {tableLayoutStyles, sortableOptions} from "../tables/tableConstants";
import orderBy from 'lodash/orderBy';

const styles = {
  table: {
    width: '100%'
  }
};

class StatsTable extends Component {
  static propTypes = {
    section: PropTypes.shape({
      id: PropTypes.number,
      students: PropTypes.array
    }),
    studentsCompletedLevelCount: PropTypes.array
  };

  state = {};

  completedLevels = {
    3: 10,
    4: 20
  };

  studentsWithCompletedLevelCount = () => {
    const {students} = this.props.section;
    return students.map(student => {
      return {
        ...student,
        // won't be this.completedLevels anymore
        completedLevelsCount: this.completedLevels[student.id] || 0
      };
    });
  };

  nameFormatter = (name, {rowData}) => {
    const {id: sectionId} = this.props.section;
    return (
      <a
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
        property: 'completedLevelsCount',
        header: {
          label: 'Completed Levels', // TODO: i18n
          props: {
            style: {
              ...tableLayoutStyles.headerCell
          }},
          transforms: [sortable]
        },
        cell: {
          props: {
            style: {
              ...tableLayoutStyles.cell
          }}
        }
      },
      {
        property: 'total_lines',
        header: {
          label: 'Lines of Code', // TODO: i18n
          props: {
            style: {
              ...tableLayoutStyles.headerCell
          }},
          transforms: [sortable]
        },
        cell: {
          props: {
            style: {
              ...tableLayoutStyles.cell
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
      >
        <Table.Header />
        <Table.Body rows={sortedRows} rowKey="id" />
      </Table.Provider>
    );
  }
}

export default StatsTable;
