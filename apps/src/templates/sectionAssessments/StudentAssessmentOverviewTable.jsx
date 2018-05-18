import React, {Component, PropTypes} from 'react';
import {Table, sort} from 'reactabular';
import {tableLayoutStyles, sortableOptions} from "../tables/tableConstants";
import commonMsg from '@cdo/locale';
import wrappedSortable from '../tables/wrapped_sortable';
import orderBy from 'lodash/orderBy';
import MultipleChoiceAnswerCell from './MultipleChoiceAnswerCell';
import {
  studentAnswerDataPropType,
  questionDataPropType
} from './assessmentDataShapes';

export const COLUMNS = {
  QUESTION: 0,
  STUDENT_ANSWER: 1,
  CORRECT_ANSWER: 2,
};

class StudentAssessmentOverviewTable extends Component {
  static propTypes= {
    questionAnswerData: PropTypes.arrayOf(questionDataPropType),
    studentAnswerData: PropTypes.arrayOf(studentAnswerDataPropType)
  };

  state = {
    [COLUMNS.NAME]: {
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

  correctAnswerColumnFormatter = (answers, {rowData, columnIndex}) => {
    const questionAnswers = rowData.answers;

    let allPossibleAnswers = [];
    let textAnswered = '';
      questionAnswers.forEach((answer) => {
        if (answer.isCorrectAnswer) {
          allPossibleAnswers.push(answer.multipleChoiceOption);
          textAnswered = allPossibleAnswers.join(', ');
        }
      });

    return (
      <MultipleChoiceAnswerCell
        id={rowData.id}
        textAnswered={textAnswered}
      />
    );
  };

  studentAnswerColumnFormatter = (studentAnswers, {rowData, rowIndex}) => {
    let studentAnswerArr = [];
    let studentResponse = '';
    const selectStudentAnswers = this.props.studentAnswerData[0].studentAnswers[rowIndex];
    selectStudentAnswers.answer.forEach((answerSelection) => {
      studentAnswerArr.push(answerSelection);
      studentResponse = studentAnswerArr.join(', ');
    });

    let allPossibleAnswers = [];
    let textAnswered = '';
      rowData.answers.forEach((answer) => {
        if (answer.isCorrectAnswer) {
          allPossibleAnswers.push(answer.multipleChoiceOption);
          textAnswered = allPossibleAnswers.join(', ');
        }
      });

    return (
      <MultipleChoiceAnswerCell
        id={rowData.id}
        textAnswered={studentResponse}
        isCorrectAnswer={(studentResponse === textAnswered)}
      />
    );
  };

  getColumns = (sortable) => {
    let dataColumns = [
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
      },
      {
        property: 'studentAnswer',
        header: {
          label: commonMsg.studentAnswer(),
          props: {style: tableLayoutStyles.headerCell},
        },
        cell: {
          format: this.studentAnswerColumnFormatter,
          props: {style: tableLayoutStyles.cell},
        }
      },
      {
        property: 'correctAnswer',
        header: {
          label: commonMsg.checkCorrectAnswer(),
          props: {style: tableLayoutStyles.headerCell},
        },
        cell: {
          format: this.correctAnswerColumnFormatter,
          props: {style: tableLayoutStyles.cell},
        }
      },
    ];
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

export default StudentAssessmentOverviewTable;
