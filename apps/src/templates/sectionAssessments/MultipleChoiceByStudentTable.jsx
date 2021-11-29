import PropTypes from 'prop-types';
import React, {Component} from 'react';
import * as Table from 'reactabular-table';
import * as sort from 'sortabular';
import {tableLayoutStyles, sortableOptions} from '../tables/tableConstants';
import i18n from '@cdo/locale';
import wrappedSortable from '../tables/wrapped_sortable';
import orderBy from 'lodash/orderBy';
import PercentAnsweredCell from './PercentAnsweredCell';
import {
  studentWithMCResponsesPropType,
  multipleChoiceQuestionPropType
} from './assessmentDataShapes';

export const COLUMNS = {
  QUESTION: 0,
  STUDENT_ANSWER: 1,
  CORRECT_ANSWER: 2
};

const ANSWER_COLUMN_WIDTH = 80;

// Single table for individual student and individual assessment
// multiple choice assessment. Each row is a single question,
// the students response to that question, and whether the student got
// the correct answer.
class MultipleChoiceByStudentTable extends Component {
  static propTypes = {
    questionAnswerData: PropTypes.arrayOf(multipleChoiceQuestionPropType),
    studentAnswerData: studentWithMCResponsesPropType
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

  onSort = selectedColumn => {
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

  questionCellFormatter = (question, {rowData, rowIndex}) => {
    return <div>{`${rowData.questionNumber}. ${question}`}</div>;
  };

  correctAnswerColumnFormatter = (responses, {rowData, columnIndex}) => {
    return (
      <PercentAnsweredCell
        id={rowData.id}
        displayAnswer={rowData.correctAnswer}
      />
    );
  };

  studentAnswerColumnFormatter = (studentAnswer, {rowData, rowIndex}) => {
    return (
      <PercentAnsweredCell
        id={rowData.id}
        displayAnswer={studentAnswer.responses || '-'}
        isCorrectAnswer={studentAnswer.isCorrect}
      />
    );
  };

  getColumns = sortable => {
    let dataColumns = [
      {
        property: 'question',
        header: {
          label: i18n.question(),
          props: {style: tableLayoutStyles.headerCell}
        },
        cell: {
          formatters: [this.questionCellFormatter],
          props: {
            style: {
              ...tableLayoutStyles.cell,
              ...styles.questionCell
            }
          }
        }
      },
      {
        property: 'studentAnswer',
        header: {
          label: i18n.studentAnswer(),
          props: {
            style: {
              ...tableLayoutStyles.headerCell,
              ...styles.answerColumnHeader
            }
          }
        },
        cell: {
          formatters: [this.studentAnswerColumnFormatter],
          props: {
            style: {
              ...tableLayoutStyles.cell,
              ...styles.answerColumnCell
            }
          }
        }
      },
      {
        property: 'correctAnswer',
        header: {
          label: i18n.checkCorrectAnswer(),
          props: {
            style: {
              ...tableLayoutStyles.headerCell,
              ...styles.answerColumnHeader
            }
          }
        },
        cell: {
          formatters: [this.correctAnswerColumnFormatter],
          props: {
            style: {
              ...tableLayoutStyles.cell,
              ...styles.answerColumnCell
            }
          }
        }
      }
    ];
    return dataColumns;
  };

  render() {
    // Define a sorting transform that can be applied to each column
    const sortable = wrappedSortable(
      this.getSortingColumns,
      this.onSort,
      sortableOptions
    );
    const columns = this.getColumns(sortable);
    const sortingColumns = this.getSortingColumns();

    const rowData = this.props.questionAnswerData.map((question, index) => {
      return {
        ...question,
        studentAnswer: this.props.studentAnswerData.studentResponses[index]
      };
    });

    const sortedRows = sort.sorter({
      columns,
      sortingColumns,
      sort: orderBy
    })(rowData);

    return (
      <Table.Provider columns={columns} style={tableLayoutStyles.table}>
        <Table.Header />
        <Table.Body rows={sortedRows} rowKey="id" />
      </Table.Provider>
    );
  }
}

const styles = {
  answerColumnHeader: {
    width: ANSWER_COLUMN_WIDTH,
    textAlign: 'center'
  },
  answerColumnCell: {
    width: ANSWER_COLUMN_WIDTH
  },
  questionCell: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: 470
  }
};

export default MultipleChoiceByStudentTable;
