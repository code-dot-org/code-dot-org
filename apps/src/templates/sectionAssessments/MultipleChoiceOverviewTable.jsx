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

const questionAnswerDataPropType = PropTypes.shape({
  id: PropTypes.number.isRequired,
  question: PropTypes.string,
  percentAnswered: PropTypes.string,
  isCorrectAnswer: PropTypes.bool,
  questions: PropTypes.object,
  studentAnswers: PropTypes.object,
});

class MultipleChoiceOverviewTable extends Component {
  static propTypes= {
    // questionAnswerData: PropTypes.arrayOf(questionAnswerDataPropType),
    questions: PropTypes.object,
    studentAnswers: PropTypes.object
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
    let dataColumns = [];

    dataColumns.push(this.getQuestionColumn(sortable));

    const columnLabelNames = Object.keys(this.props.questions).reduce((accumulator, currentVal) => {
      const question = this.props.questions[currentVal] ;

      if(accumulator.length < question.answerOptions.length){
        accumulator = question.answerOptions.map( answerOptionsObj => answerOptionsObj.option );
      }
      return accumulator; 
    },[])

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

