import {Typography} from '@mui/material';
import orderBy from 'lodash/orderBy';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import * as Table from 'reactabular-table';
import * as sort from 'sortabular';

import i18n from '@cdo/locale';

import {tableLayoutStyles, sortableOptions} from '../tables/tableConstants';
import wrappedSortable from '../tables/wrapped_sortable';

import {freeResponsesDataPropType} from './assessmentDataShapes';

import moduleStyles from './free-responses-table.module.scss';

export const COLUMNS = {
  NAME: 0,
  RESPONSE: 1,
};

class FreeResponsesAssessmentsTable extends Component {
  static propTypes = {
    freeResponses: PropTypes.arrayOf(freeResponsesDataPropType),
  };

  state = {
    [COLUMNS.NAME]: {
      direction: 'desc',
      position: 0,
    },
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
          desc: 'asc',
        },
        selectedColumn,
      }),
    });
  };

  responseCellFormatter = (response, {rowData, rowIndex}) => {
    return (
      <div>
        {response && (
          <Typography variant="body3" className={moduleStyles.response}>
            {response}
          </Typography>
        )}
        {!response && (
          <Typography variant="body3" className={moduleStyles.noResponse}>
            {i18n.emptyFreeResponse()}
          </Typography>
        )}
      </div>
    );
  };

  getColumns = (sortable, index) => {
    let dataColumns = [
      {
        property: 'name',
        header: {
          label: i18n.studentName(),
          props: {
            style: tableLayoutStyles.headerCell,
            className: moduleStyles.studentNameHeaderCell,
          },
          transforms: [sortable],
        },
        cell: {
          props: {
            style: tableLayoutStyles.cell,
            className: moduleStyles.studentNameCell,
          },
        },
      },
      {
        property: 'response',
        header: {
          label: i18n.response(),
          props: {style: tableLayoutStyles.headerCell},
        },
        cell: {
          formatters: [this.responseCellFormatter],
          props: {style: tableLayoutStyles.cell},
        },
      },
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
      sort: orderBy,
    })(this.props.freeResponses);

    return (
      <Table.Provider columns={columns} style={tableLayoutStyles.table}>
        <Table.Header />
        <Table.Body rows={sortedRows} rowKey="id" />
      </Table.Provider>
    );
  }
}

export default FreeResponsesAssessmentsTable;
