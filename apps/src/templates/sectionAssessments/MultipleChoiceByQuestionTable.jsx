import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {Table, sort} from 'reactabular';
import {tableLayoutStyles, sortableOptions} from '../tables/tableConstants';
import i18n from '@cdo/locale';
import wrappedSortable from '../tables/wrapped_sortable';
import orderBy from 'lodash/orderBy';
import PercentAnsweredCell from './PercentAnsweredCell';

export const COLUMNS = {
  NAME: 0,
  ANSWER: 1
};

const studentAnswerPropType = PropTypes.shape({
  id: PropTypes.number,
  name: PropTypes.string,
  answer: PropTypes.string,
  correct: PropTypes.bool
});

class MultipleChoiceByQuestionTable extends Component {
  static propTypes = {
    studentAnswers: PropTypes.arrayOf(studentAnswerPropType)
  };

  state = {
    [COLUMNS.ANSWER]: {
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

  answerCellFormatter = (
    answer,
    {rowData, columnIndex, rowIndex, property}
  ) => {
    return (
      <PercentAnsweredCell
        id={rowData.id}
        displayAnswer={answer}
        isCorrectAnswer={rowData.correct}
      />
    );
  };

  getColumns = (sortable, index) => {
    let dataColumns = [
      {
        property: 'name',
        header: {
          label: i18n.studentName(),
          props: {
            style: tableLayoutStyles.headerCell
          }
        },
        cell: {
          props: {
            style: tableLayoutStyles.cell
          }
        }
      },
      {
        property: 'answer',
        header: {
          label: i18n.answer(),
          props: {
            style: tableLayoutStyles.headerCell
          },
          transforms: [sortable]
        },
        cell: {
          format: this.answerCellFormatter,
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
    })(this.props.studentAnswers);

    return (
      <Table.Provider
        columns={columns}
        style={{...tableLayoutStyles.table, width: 660}}
      >
        <Table.Header />
        <Table.Body rows={sortedRows} rowKey="id" />
      </Table.Provider>
    );
  }
}

export default MultipleChoiceByQuestionTable;
