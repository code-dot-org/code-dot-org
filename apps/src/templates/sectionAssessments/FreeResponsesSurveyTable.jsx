import React, {Component, PropTypes} from 'react';
import {Table, sort} from 'reactabular';
import {tableLayoutStyles, sortableOptions} from "../tables/tableConstants";
import i18n from '@cdo/locale';
import wrappedSortable from '../tables/wrapped_sortable';
import orderBy from 'lodash/orderBy';

export const COLUMNS = {
  RESPONSE: 0,
};

const freeResponsesDataPropType = PropTypes.shape({
  id:  PropTypes.number,
  studentId: PropTypes.string,
  name: PropTypes.string,
  response: PropTypes.string,
});

class FreeResponsesSurveyTable extends Component {
  static propTypes= {
    freeResponses:PropTypes.arrayOf(freeResponsesDataPropType),
  };

  state = {
    [COLUMNS.RESPONSE]: {
      direction: 'desc',
      position: 0
    }
  };

  getSortingColumns = () => {
    return this.state.sortingColumns || {};
  };

  onSort = (selectedColumn) => {
    this.setState({
      sortingColumns: sort.byColumn({
        sortingColumns: this.state.sortingColumns,
        sortingOrder: {
          FIRST: 'asc',
          asc: 'desc',
          desc: 'asc',
        },
        selectedColumn
      })
    });
  };

  studentResponseColumnFormatter = (response, {rowIndex}) => {
    const numStudentResponses = this.props.freeResponses.length;

    if (numStudentResponses >= 5) {
      return response;
    }
  };

  getColumns = (sortable) => {
    let dataColumns = [
      {
        property: 'response',
        header: {
          label: i18n.response(),
          props: {style: tableLayoutStyles.headerCell},
          transforms: [sortable],
        },
        cell: {
          format: this.studentResponseColumnFormatter,
          props: {style:tableLayoutStyles.cell},
        }
      },
    ];
    return dataColumns;
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
    })(this.props.freeResponses);

    return (
        <Table.Provider
          columns={columns}
          style={tableLayoutStyles.table}
        >
          <Table.Header />
          <Table.Body rows={sortedRows} rowKey="id" />
        </Table.Provider>
    );
  }
}

export default FreeResponsesSurveyTable;
