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

const calculateNotAnswered = (multipleChoiceDataArr) => {
    let total = 0;
  multipleChoiceDataArr.forEach (studentsAnswersObj => {
        if (studentsAnswersObj.percentAnswered) {
            total += studentsAnswersObj.percentAnswered;
        }
    });

    return (100 - total);
};

const answerColumnsFormatter = (percentAnswered, {rowData, columnIndex, rowIndex, property}) => {
  const cell = rowData.answers[columnIndex - 1];

  let percentValue = 0;

  if (property === 'notAnswered') {
     percentValue = calculateNotAnswered(rowData.answers);
  } else {
     percentValue = (cell && cell.percentAnswered) || '-';
  }

  return (
      <MultipleChoiceAnswerCell
        id={rowData.id}
        percentValue={percentValue}
        isCorrectAnswer={cell && cell.isCorrectAnswer}

      />
  );
};

const questionAnswerDataPropType = PropTypes.shape({
  id: PropTypes.number.isRequired,
  question: PropTypes.string,
  percentAnswered: PropTypes.string,
  isCorrectAnswer: PropTypes.bool,
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

  getAnswerColumn = (index) => (
    {
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
    let columns = this.getQuestionColumn(sortable) ;

    dataColumns.push({property: 'question', ...columns});

    for (let i = 0; i < maxAnswerChoicesLength; i++) {
      let questionOption = this.getAnswerColumn(i);

      dataColumns.push({property: 'percentAnswered' , ...questionOption});
    }

    // Add 2 to maxAnswerChoicesLength to ensure notAnswered is the last column.
    // maxAnswerChoicesLength does not include question column.
    dataColumns.push({property: 'notAnswered', ...this.getNotAnsweredColumn(maxAnswerChoicesLength + 2)});

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
