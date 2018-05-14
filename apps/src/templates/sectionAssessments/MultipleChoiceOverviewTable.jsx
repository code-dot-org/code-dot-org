import React, {Component, PropTypes} from 'react';
import {Table, sort} from 'reactabular';
import {tableLayoutStyles, sortableOptions} from "../tables/tableConstants";
import commonMsg from '@cdo/locale';
import wrappedSortable from '../tables/wrapped_sortable';
import orderBy from 'lodash/orderBy';
import MultipleChoiceAnswerCell, { TableHeader } from './MultipleChoiceAnswerCell';

const NOT_ANSWERED = 'notAnswered';

export const COLUMNS = {
  QUESTION: 0,
};

const questionAnswerDataPropType = PropTypes.shape({
  question: PropTypes.number,
  answer: PropTypes.array,
  answers: PropTypes.array,
  // id: PropTypes.number.isRequired,
  answerOptions: PropTypes.array,
  questionText: PropTypes.string,
  isCorrectAnswer: PropTypes.bool,
  percentValue: PropTypes.number,
  submitted: PropTypes.bool,
  name: PropTypes.string,
});

class MultipleChoiceOverviewTable extends Component {
  static propTypes= {
    questions: PropTypes.arrayOf(questionAnswerDataPropType),
    students: PropTypes.arrayOf(questionAnswerDataPropType)
  };

  state = {
    [COLUMNS.QUESTION]: {
      direction: 'desc',
      position: 0
    }
  };

  calculatePercentNotAnswered = (index) => {
    const students = this.props.students;
    const maxStudent = students.length;
    let notAnswered = 0;
  
    students.forEach(student => { 
      const studentAnswers = student.answers;
      const answerArr = studentAnswers[index];
  
      if (answerArr) {
        for (let i=0; i< answerArr.answer.length; i++) {
          if (answerArr.answer[i] === '') {
            console.log('answerArr.answer ---->', answerArr.answer);
            notAnswered += 1;
            console.log('not answered --->', notAnswered);
            break; 
          }
        }
      }
    });
    console.log('not answered --->', notAnswered);
    return Math.floor((notAnswered / maxStudent) * 100);
  };
  
  calculatePercentAnswered = (option, index) => {
    const students = this.props.students;
    const maxStudent = students.length;
    console.log('maxStudent -->', maxStudent);
    let numAnsweredForOption = 0; 

    students.forEach(student => { 
      const studentAnswers = student.answers;
      const answerArr = studentAnswers[index];

      if (answerArr) {

        for (let i=0; i< answerArr.answer.length; i++) {
          if (answerArr.answer[i] === option) {
            console.log('answerArr.answer ---->', answerArr.answer);
            numAnsweredForOption += 1;
            console.log('numAnsweredForOption --->', numAnsweredForOption);
            break;
          }
        }
      }
    });
    return Math.floor((numAnsweredForOption / maxStudent) * 100);
  };

  notAnsweredColumnsFormatter = (answer, {rowData, columnIndex, rowIndex}) => {
    const cell = rowData.answerOptions[columnIndex - 1];
    let percentValue = 0;
    percentValue = this.calculatePercentNotAnswered(rowIndex);

    return (
      <MultipleChoiceAnswerCell
        id={rowData.id}
        percentValue={percentValue}
        isCorrectAnswer={cell && cell.isCorrectAnswer}
      />
    );
  };

  answerColumnsFormatter = (answer, {rowData, columnIndex, rowIndex}) => {
    let percentValue = 0;
    const cell = rowData.answerOptions[columnIndex - 1];

    if (cell) {    
      percentValue = this.calculatePercentAnswered(cell.option, rowIndex);
    } else {
      percentValue = -1;
    }
 
    return (
      <MultipleChoiceAnswerCell
        id={rowData.id}
        percentValue={percentValue}
        isCorrectAnswer={cell && cell.isCorrectAnswer}
      />
    );
  };

  // answerHeaderFormatter = (label, { rowData }) => {
  //   return (
  //     <TableHeader
  //       answerOptions={label}
  //     />
  //   );
  // };

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
        // format: this.answerHeaderFormatter,
        props: {style: tableLayoutStyles.headerCell},
      },
      cell: {
        format: this.notAnsweredColumnsFormatter,
        props: {style: tableLayoutStyles.cell},
      }
    }
  );

  getAnswerColumn = (columnLabel) => (
    {
      property: 'answer',
      header: {
        label: columnLabel,
        // format: this.answerHeaderFormatter,
        props: {style: tableLayoutStyles.customStyle},
      },
      cell: {
        format: this.answerColumnsFormatter,
        props: {style: tableLayoutStyles.cell},
      }
    }
  );

  getQuestionColumn = (sortable) => (
    {
      property: 'questionText',
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
    const maxOptionsQuestion = [...this.props.questions].sort((question1, question2) => (
      question1.answerOptions.length - question2.answerOptions.length
    )).pop();

    let columnLabelNames = maxOptionsQuestion.answerOptions.map((answer) => {
      return this.getAnswerColumn(answer.option);
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
    })(this.props.questions);

    return (
      <Table.Provider
        columns={columns}
        style={tableLayoutStyles.table}
      >
      <Table.Header/>
      <Table.Body rows={sortedRows} rowKey="id" />
      </Table.Provider>
    );
  }
}

export default MultipleChoiceOverviewTable;

