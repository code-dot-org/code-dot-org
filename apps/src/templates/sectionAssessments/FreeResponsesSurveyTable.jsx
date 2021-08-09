import PropTypes from 'prop-types';
import React, {Component} from 'react';
import * as Table from 'reactabular-table';
import * as sort from 'sortabular';
import {tableLayoutStyles, sortableOptions} from '../tables/tableConstants';
import i18n from '@cdo/locale';
import wrappedSortable from '../tables/wrapped_sortable';
import orderBy from 'lodash/orderBy';
import color from '@cdo/apps/util/color';

export const COLUMNS = {
  RESPONSE: 0
};

const freeResponsesDataPropType = PropTypes.shape({
  response: PropTypes.string
});

class FreeResponsesSurveyTable extends Component {
  static propTypes = {
    freeResponses: PropTypes.arrayOf(freeResponsesDataPropType)
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

  onSort = selectedColumn => {
    this.setState({
      sortingColumns: sort.byColumn({
        sortingColumns: this.state.sortingColumns,
        sortingOrder: {
          FIRST: 'asc',
          asc: 'desc',
          desc: 'asc'
        },
        selectedColumn
      })
    });
  };

  studentResponseColumnFormatter = (response, {rowIndex}) => {
    return (
      <div>
        {response && <div>{response}</div>}
        {!response && (
          <div style={styles.noResponse}>{i18n.emptyFreeResponse()}</div>
        )}
      </div>
    );
  };

  getColumns = sortable => {
    let dataColumns = [
      {
        property: 'response',
        header: {
          label: i18n.response(),
          props: {style: tableLayoutStyles.headerCell}
        },
        cell: {
          formatters: [this.studentResponseColumnFormatter],
          props: {style: tableLayoutStyles.cell}
        }
      }
    ];
    return dataColumns;
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
    })(this.props.freeResponses);

    return (
      <Table.Provider columns={columns} style={tableLayoutStyles.table}>
        <Table.Header />
        <Table.Body rows={sortedRows} rowKey="index" />
      </Table.Provider>
    );
  }
}

const styles = {
  noResponse: {
    color: color.lighter_gray
  }
};

export default FreeResponsesSurveyTable;
