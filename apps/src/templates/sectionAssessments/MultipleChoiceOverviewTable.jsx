import React, {Component, PropTypes} from 'react';
import {Table, sort} from 'reactabular';
import {tableLayoutStyles, sortableOptions} from "../tables/tableConstants";
import commonMsg from '@cdo/locale';
import wrappedSortable from '../tables/wrapped_sortable';
import orderBy from 'lodash/orderBy';
import MultipleChoiceAnswerCell from './MultipleChoiceAnswerCell';

export const COLUMNS = {
  QUESTION: 0,
};

const alphabetMapper =  [
  commonMsg.answerOptionA(),
  commonMsg.answerOptionB(),
  commonMsg.answerOptionC(),
  commonMsg.answerOptionD(),
  commonMsg.answerOptionE(),
  commonMsg.answerOptionF(),
  commonMsg.answerOptionG(),
];

const answerColumnsFormatter = (percentAnswered, {rowData, columnIndex, rowIndex, property}) => {
  const cell = rowData.answers[columnIndex - 1];
  return (
      <MultipleChoiceAnswerCell
        id={rowData.id}
        percentValue={(cell && `${cell.percentAnswered}%`) || '-'}
        isCorrectAnswer={cell && cell.isCorrectAnswer}
      />
  );
};

const questionAnswerDataPropType = PropTypes.shape({
  id: PropTypes.number.isRequired,
  question: PropTypes.string,
  percentAnswered: PropTypes.string,
  isCorrectAnswer: PropTypes.bool,
  notAnswered: PropTypes.string,
});

class MultipleChoiceOverviewTable extends Component {
  static propTypes= {
    questionAnswerData: PropTypes.arrayOf(questionAnswerDataPropType),
  };

  state = {
    [COLUMNS.QUESTION]: {
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

  getNotAnsweredColumn = () => (
    {
      property: 'notAnswered',
      header: {
        label: commonMsg.notAnswered(),
        props: {style: tableLayoutStyles.headerCell},
      },
      cell: {
        props: {style: tableLayoutStyles.cell},
      }
    }
  );

  getAnswerColumn = (index) => (
    {
      property: 'percentAnswered',
      header: {
        label: alphabetMapper[index],
        props: {style: tableLayoutStyles.headerCell},
      },
      cell: {
        format: answerColumnsFormatter,
        props: {style: tableLayoutStyles.cell},
      }
    }
  );

  getQuestionColumn = (sortable) => (
    {
      property: 'question',
      header: {
        label: commonMsg.question(),
        props: {style: tableLayoutStyles.headerCell},
        transforms: [sortable],
      },
      cell: {
        props: {style: tableLayoutStyles.cell},
      }
    }
  );

  getColumns = (sortable) => {
    const maxAnswerChoicesLength = this.props.questionAnswerData.reduce((answersTotal, currentAnswerCount) => {
      return Math.max(answersTotal, currentAnswerCount.answers.length);
    }, 0);

    let dataColumns = [];
    dataColumns.push(this.getQuestionColumn(sortable));
    for (let i = 0; i < maxAnswerChoicesLength; i++) {
      dataColumns.push(this.getAnswerColumn(i));
    }
    dataColumns.push(this.getNotAnsweredColumn());

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
    })(this.props.questionAnswerData);

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

export default MultipleChoiceOverviewTable;
