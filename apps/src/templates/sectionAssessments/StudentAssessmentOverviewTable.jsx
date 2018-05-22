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

  getCorrectAnswer = (multipleChoiceAnswers) => {
    return multipleChoiceAnswers.filter(answerObj => {
      return answerObj.isCorrectAnswer;
    }).map(answerObj => {
      return answerObj.multipleChoiceOption;
    }).join(', ');
  };

  correctAnswerColumnFormatter = (answers, {rowData, columnIndex}) => {
    const multipleChoiceAnswers = rowData.answers;

    let displayAnswer = this.getCorrectAnswer(multipleChoiceAnswers);

    return (
      <MultipleChoiceAnswerCell
        id={rowData.id}
        displayAnswer={displayAnswer}
      />
    );
  };

  studentAnswerColumnFormatter = (studentAnswers, {rowData, rowIndex}) => {
    const selectStudentAnswers = this.props.studentAnswerData[0].studentAnswers[rowIndex];
    const multipleChoiceAnswers = rowData.answers;

    let studentResponse = selectStudentAnswers.answer.map(answerSelection => {
      return answerSelection;
    }).join(', ');

    let displayAnswer = this.getCorrectAnswer(multipleChoiceAnswers);

    return (
      <MultipleChoiceAnswerCell
        id={rowData.id}
        displayAnswer={studentResponse}
        isCorrectAnswer={(studentResponse === displayAnswer)}
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
