import React, {Component, PropTypes} from 'react';
import {Table, sort} from 'reactabular';
import {tableLayoutStyles, sortableOptions} from "../tables/tableConstants";
import commonMsg from '@cdo/locale';
import wrappedSortable from '../tables/wrapped_sortable';
import orderBy from 'lodash/orderBy';
import MultipleChoiceAnswerCell from './MultipleChoiceAnswerCell';

const NOT_ANSWERED = 'notAnswered';

export const COLUMNS = {
  QUESTION: 0,
};

const questionAnswerDataPropType = PropTypes.shape({
  question: PropTypes.number,
  answer: PropTypes.array,
  id: PropTypes.number.isRequired,
  answerOptions: PropTypes.array,
  questionText: PropTypes.string,
  isCorrectAnswer: PropTypes.bool,
  percentValue: PropTypes.number,
});

class MultipleChoiceOverviewTable extends Component {
  static propTypes= {
    questions: PropTypes.arrayOf(questionAnswerDataPropType),
    studentAnswers: PropTypes.objectOf(questionAnswerDataPropType)
  };

  state = {
    [COLUMNS.QUESTION]: {
      direction: 'desc',
      position: 0
    }
  };

  calculatePercentNotAnswered = (index) => {
    const studentAnswers = this.props.studentAnswers;
    const maxStudent = Object.keys(studentAnswers);
    let notAnswered = 0;

    maxStudent.forEach(studentId => {  
      const answerObj = studentAnswers[studentId][index];
      if (!answerObj.answer) {
          notAnswered += 1;
      }
    });
    return Math.floor((notAnswered / maxStudent.length) * 100);
  };

  // calculatePercentAnswered = (option, index) => {
  //   const studentAnswers = this.props.studentAnswers;
  //   const maxStudent = Object.keys(studentAnswers);
  //   let answered =0;

  //   maxStudent.forEach( studentId => {
  //     const answerObj = studentAnswers[studentId][index];
  //     if (answerObj && answerObj.answer === option) {
  //       answered += 1;
  //     }
  //   });
  //   return Math.floor((answered / maxStudent.length ) * 100);
  // };
  
  calculatePercentAnswered = (option, index) => {
    const studentAnswers = this.props.studentAnswers;
    const maxStudent = Object.keys(studentAnswers);
    let numAnsweredForOprtion = 0; 

    maxStudent.forEach( studentId => {
      const answerObj = studentAnswers[studentId][index];  
      if (answerObj) {

        for (let i=0; i< answerObj.answer.length; i++){
          if (answerObj.answer[i] === option){
            numAnsweredForOprtion += 1;
            break;
          }
        }

        // answerObj.answer.forEach(answer => {
        //     if (answer === option) {
        //       numAnsweredForOprtion += 1;
        //       //return true;
        //     }
        // });

        //
        // for (let i=0; i< answerArr.length; i++){
        //   if (answerArr[i] === option){
        //     numAnsweredForOprtion += 1;
        //     break;
        //   }
        // }
      }
    });
    return Math.floor((numAnsweredForOprtion / maxStudent.length ) * 100);
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
    // }
    } else {
        percentValue = '-';
    }
    return (
      <MultipleChoiceAnswerCell
        id={rowData.id}
        percentValue={percentValue}
        isCorrectAnswer={cell && cell.isCorrectAnswer}
      />
    );
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
        props: {style: tableLayoutStyles.headerCell},
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
      <Table.Header />
      <Table.Body rows={sortedRows} rowKey="id" />
      </Table.Provider>
    );
  }
}

export default MultipleChoiceOverviewTable;

