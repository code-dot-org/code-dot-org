import React, {Component, PropTypes} from 'react';
import {Table, sort} from 'reactabular';
import {tableLayoutStyles, sortableOptions} from "../tables/tableConstants";
import commonMsg from '@cdo/locale';
import wrappedSortable from '../tables/wrapped_sortable';
import orderBy from 'lodash/orderBy';
import MultipleChoiceAnswerCell from './MultipleChoiceAnswerCell';

export const COLUMNS = {
  QUESTION: 0,
  ANSWER_1: 1,
  ANSWER_2: 2,
  NOT_ANSWERED: 3,
};

const alphabetMapper =  ['-', 'A', 'B', 'C', 'D', 'E', 'F', 'Not Answered'];

const answerOptionsFormatter = (percentAnswered, {rowData, columnIndex, rowIndex, property}, index) => {
  return (
      <MultipleChoiceAnswerCell
        id={rowData.id}
        percentValue={rowData.answers[columnIndex] && `${rowData.answers[columnIndex].percentAnswered}%` || '-'}
        isCorrectAnswer={rowData.answers[columnIndex] && rowData.answers[columnIndex].isCorrectAnswer || false}
      />
  );
};

const questionAnswerDataPropType = PropTypes.shape({
  id: PropTypes.number.isRequired,
  question: PropTypes.string,
  percentAnswered: PropTypes.string,
  isCorrectAnswer: PropTypes.bool,
  percentAnsweredOptionOne: PropTypes.string,
  percentAnsweredOptionTwo: PropTypes.string,
  optionOneIsCorrect: PropTypes.bool,
  optionTwoIsCorrect: PropTypes.bool,
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

  answerOptions = (index) => (
    {
      header: {
        label: alphabetMapper[index],
        props: {
          style: {
          ...tableLayoutStyles.headerCell,
        }},
      },
      cell: {
        format: answerOptionsFormatter,
        props: {
          style: {
          ...tableLayoutStyles.cell,
        }}
      }
    }
  );

  questionColumn = (sortable) => (
    {
      header: {
        label: commonMsg.question(),
        props: {
          style: {
          ...tableLayoutStyles.headerCell,
        }},
        transforms: [sortable],
      },
      cell: {
        props: {
          style: {
          ...tableLayoutStyles.cell,
        }}
      },
    }
  );

  getColumns = (sortable) => {
    const maxAnswerChoicesLength = this.props.questionAnswerData.reduce((acc, cur) => {
      if (cur.answers.length > acc) {
        return cur.answers.length;
      }
      return acc;
    }, 0);

    let dataColumns = [];
    let columns = this.questionColumn(sortable) ;

    for (let i = 0; i < maxAnswerChoicesLength; i++) {
      let questionOption = this.answerOptions(i);
      if (i === 0) {
        dataColumns.push({property: 'question', ...columns});
      } else {
        dataColumns.push({property: 'percentAnswered' , ...questionOption});
      }
    }
      dataColumns.push({property: 'notAnswered', ...this.answerOptions(7)});

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
