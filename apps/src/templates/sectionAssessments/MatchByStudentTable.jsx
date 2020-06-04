import React, {Component} from 'react';
import * as Table from 'reactabular-table';
import * as sort from 'sortabular';
import {tableLayoutStyles, sortableOptions} from '../tables/tableConstants';
import i18n from '@cdo/locale';
import wrappedSortable from '../tables/wrapped_sortable';
import orderBy from 'lodash/orderBy';
import PercentAnsweredCell from './PercentAnsweredCell';
import {
  matchQuestionPropType,
  studentMatchResponsePropType
} from './assessmentDataShapes';

export const COLUMNS = {
  OPTION: 0,
  STUDENT_ANSWER: 1,
  CORRECT_ANSWER: 2
};

const ANSWER_COLUMN_WIDTH = 200;

const styles = {
  answerColumnHeader: {
    width: ANSWER_COLUMN_WIDTH,
    textAlign: 'center'
  },
  answerColumnCell: {
    width: ANSWER_COLUMN_WIDTH
  },
  optionCell: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: 470
  }
};

class MatchByStudentTable extends Component {
  static propTypes = {
    questionAnswerData: matchQuestionPropType,
    studentAnswerData: studentMatchResponsePropType
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

  optionCellFormatter = (question, {rowData, rowIndex}) => {
    return <div>{`${question}`}</div>;
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
        displayAnswer={rowData.studentAnswer || '-'}
        isCorrectAnswer={rowData.studentAnswer === rowData.correctAnswer}
      />
    );
  };

  getColumns = sortable => {
    let dataColumns = [
      {
        property: 'option',
        header: {
          label: i18n.option(),
          props: {style: tableLayoutStyles.headerCell}
        },
        cell: {
          formatters: [this.optionCellFormatter],
          props: {
            style: {
              ...tableLayoutStyles.cell,
              ...styles.optionCell
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

    const rowData = this.props.questionAnswerData.options.map(
      (option, index) => {
        return {
          id: index,
          option: option.text,
          correctAnswer: this.props.questionAnswerData.answers[index].text,
          studentAnswer:
            this.props.studentAnswerData.responses[index] !== null
              ? this.props.questionAnswerData.answers[
                  this.props.studentAnswerData.responses[index]
                ].text
              : null
        };
      }
    );

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

export default MatchByStudentTable;
