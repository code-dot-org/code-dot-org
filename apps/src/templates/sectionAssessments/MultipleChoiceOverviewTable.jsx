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

const NOT_ANSWERED = 'notAnswered';

const answerColumnsFormatter = (percentAnswered, {rowData, columnIndex, rowIndex, property}) => {
  const cell = rowData.answers[columnIndex - 1];

  let percentValue = 0;

  if (property === NOT_ANSWERED) {
     percentValue = rowData.notAnswered;
  } else {
     percentValue = (cell && cell.percentAnswered);
  }

  return (
      <MultipleChoiceAnswerCell
        id={rowData.id}
        percentValue={percentValue}
        isCorrectAnswer={cell && cell.isCorrectAnswer}
      />
  );
};

const answerDataPropType = PropTypes.shape({
  multipleChoiceOption: PropTypes.string,
  percentAnswered: PropTypes.number,
  isCorrectAnswer: PropTypes.bool,
});

const questionDataPropType = PropTypes.shape({
  id: PropTypes.number.isRequired,
  question: PropTypes.string.isRequired,
  answers: PropTypes.arrayOf(answerDataPropType),
  notAnswered: PropTypes.number.isRequired,
});

class MultipleChoiceOverviewTable extends Component {
  static propTypes= {
    questionAnswerData: PropTypes.arrayOf(questionDataPropType),
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
      property: NOT_ANSWERED,
      header: {
        label: commonMsg.notAnswered(),
        props: {style: tableLayoutStyles.headerCell},
      },
      cell: {
        format: answerColumnsFormatter,
        props: {style: tableLayoutStyles.cell},
      }
    }
  );

  getAnswerColumn = (columnLabel) => (
    {
      property: 'percentAnswered',
      header: {
        label: columnLabel,
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
    const maxOptionsQuestion = [...this.props.questionAnswerData].sort((question1, question2) => (
      question1.answers.length - question2.answers.length
    )).pop();

    let columnLabelNames = maxOptionsQuestion.answers.map((answer) => {
      return this.getAnswerColumn(answer.multipleChoiceOption);
    });

    return [
      this.getQuestionColumn(sortable),
      ...columnLabelNames,
      this.getNotAnsweredColumn(),
    ];

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

