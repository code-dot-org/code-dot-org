import React, {Component, PropTypes} from 'react';
import {Table, sort} from 'reactabular';
import {tableLayoutStyles, sortableOptions} from "../tables/tableConstants";
import i18n from '@cdo/locale';
import wrappedSortable from '../tables/wrapped_sortable';
import orderBy from 'lodash/orderBy';
import MultipleChoiceAnswerCell from './MultipleChoiceAnswerCell';
import {
  studentAnswerDataPropType,
} from './assessmentDataShapes';

export const COLUMNS = {
  QUESTION: 0,
  STUDENT_ANSWER: 1,
  CORRECT_ANSWER: 2,
};

const ANSWER_COLUMN_WIDTH = 80;

const styles = {
  answerColumnHeader: {
    width: ANSWER_COLUMN_WIDTH,
    textAlign: 'center',
  },
  answerColumnCell: {
    width: ANSWER_COLUMN_WIDTH,
  },
  questionCell: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: 470,
  }
};

// Custom data shapes for table showing a list of questions and
// what an individual student answered for each question.
const answerDataPropType = PropTypes.shape({
  multipleChoiceOption: PropTypes.string,
  isCorrectAnswer: PropTypes.bool,
});

const questionDataPropType = PropTypes.shape({
  id: PropTypes.number.isRequired,
  question: PropTypes.string.isRequired,
  answers: PropTypes.arrayOf(answerDataPropType),
});

// Single table for individual student and individual assessment
// multiple choice assessment. Each row is a single question,
// the students response to that question, and whether the student got
// the correct answer.
class StudentAssessmentOverviewTable extends Component {
  static propTypes= {
    questionAnswerData: PropTypes.arrayOf(questionDataPropType),
    studentAnswerData: studentAnswerDataPropType
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
    const answersArr = multipleChoiceAnswers.filter(answerObj => {
      return answerObj.isCorrectAnswer;
    });

    const getCorrectAnswers = answersArr.map(answerObj => {
      return answerObj.multipleChoiceOption;
    });

    return getCorrectAnswers.join(',');
  };

  correctAnswerColumnFormatter = (answers, {rowData, columnIndex}) => {
    return (
      <MultipleChoiceAnswerCell
        id={rowData.id}
        displayAnswer={rowData.correctAnswer}
      />
    );
  };

  studentAnswerColumnFormatter = (studentAnswers, {rowData, rowIndex}) => {
    const answerData = this.props.studentAnswerData.studentAnswers[rowIndex];

    return (
      <MultipleChoiceAnswerCell
        id={rowData.id}
        displayAnswer={answerData.answers}
        isCorrectAnswer={answerData.status === 'correct'}
      />
    );
  };

  getColumns = (sortable) => {
    let dataColumns = [
      {
        property: 'question',
        header: {
          label: i18n.question(),
          props: {style: tableLayoutStyles.headerCell},
          transforms: [sortable],
        },
        cell: {
          props: {
            style: {
              ...tableLayoutStyles.cell,
              ...styles.questionCell,
            }
          },
        }
      },
      {
        property: 'studentAnswer',
        header: {
          label: i18n.studentAnswer(),
          props: {
            style: {
              ...tableLayoutStyles.headerCell,
              ...styles.answerColumnHeader,
            }
          },
        },
        cell: {
          format: this.studentAnswerColumnFormatter,
          props: {
            style: {
              ...tableLayoutStyles.cell,
              ...styles.answerColumnCell,
            }
          },
        }
      },
      {
        property: 'correctAnswer',
        header: {
          label: i18n.checkCorrectAnswer(),
          props: {
            style: {
              ...tableLayoutStyles.headerCell,
              ...styles.answerColumnHeader,
            }
          },
        },
        cell: {
          format: this.correctAnswerColumnFormatter,
          props: {
            style: {
              ...tableLayoutStyles.cell,
              ...styles.answerColumnCell,
            }
          },
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
