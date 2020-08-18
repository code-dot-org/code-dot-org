import PropTypes from 'prop-types';
import React, {Component} from 'react';
import * as Table from 'reactabular-table';
import * as sort from 'sortabular';
import {tableLayoutStyles, sortableOptions} from '../tables/tableConstants';
import i18n from '@cdo/locale';
import wrappedSortable from '../tables/wrapped_sortable';
import orderBy from 'lodash/orderBy';
import PercentAnsweredCell from './PercentAnsweredCell';
import color from '@cdo/apps/util/color';
import MultipleChoiceSurveyQuestionDialog from './MultipleChoiceSurveyQuestionDialog';
import {multipleChoiceDataPropType} from './assessmentDataShapes';

export const COLUMNS = {
  QUESTION: 0
};

const ANSWER_COLUMN_WIDTH = 40;
const MIN_ROW_HEIGHT = 35;

const styles = {
  table: {
    ...tableLayoutStyles.table,
    tableLayout: 'fixed'
  },
  answerColumnHeader: {
    width: ANSWER_COLUMN_WIDTH,
    textAlign: 'center',
    height: MIN_ROW_HEIGHT
  },
  answerColumnCell: {
    padding: 0,
    height: '100%'
  },
  answerColumnCellContent: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%'
  },
  questionCell: {
    height: MIN_ROW_HEIGHT
  },
  link: {
    color: color.teal
  }
};

const NOT_ANSWERED = 'notAnswered';

const answerColumnsFormatter = (
  percentAnswered,
  {rowData, columnIndex, rowIndex, property}
) => {
  const cell = rowData.answers[columnIndex - 1];

  // Default value for questions that don't include this column
  let percentValue = -1;

  if (property === NOT_ANSWERED) {
    percentValue = rowData.notAnswered;
  } else if (cell) {
    percentValue = cell.percentAnswered;
  }

  return (
    <PercentAnsweredCell
      id={rowData.id}
      percentValue={percentValue}
      isSurvey={true}
      mainLayoutStyle={styles.answerColumnCellContent}
      valueLayoutStyle={{}}
    />
  );
};

/**
 * A single table that shows students' responses to each multiple choice question for a survey.
 * The table displays the percent of students that select an answer choice and
 * percent of students that did not answer the question.
 */
class MultipleChoiceSurveyOverviewTable extends Component {
  static propTypes = {
    multipleChoiceSurveyData: PropTypes.arrayOf(multipleChoiceDataPropType)
  };

  state = {
    [COLUMNS.QUESTION]: {
      direction: 'desc',
      position: 0
    },
    selectedQuestionIndex: -1
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

  selectQuestion = index => this.setState({selectedQuestionIndex: index});

  closeDialog = () => this.setState({selectedQuestionIndex: -1});

  questionFormatter = (
    question,
    {rowData, columnIndex, rowIndex, property}
  ) => {
    return (
      <div>
        <a
          style={styles.link}
          onClick={() => this.selectQuestion(rowData.questionNumber - 1)}
        >
          {`${rowData.questionNumber}. ${question}`}
        </a>
      </div>
    );
  };

  getNotAnsweredColumn = () => ({
    property: NOT_ANSWERED,
    header: {
      label: i18n.none(),
      props: {
        style: {
          ...tableLayoutStyles.headerCell,
          ...styles.answerColumnHeader
        }
      }
    },
    cell: {
      formatters: [answerColumnsFormatter],
      props: {
        style: {
          ...tableLayoutStyles.cell,
          ...styles.answerColumnCell
        }
      }
    }
  });

  getAnswerColumn = columnLabel => ({
    property: 'percentAnswered',
    header: {
      label: columnLabel,
      props: {
        style: {
          ...tableLayoutStyles.headerCell,
          ...styles.answerColumnHeader
        }
      }
    },
    cell: {
      formatters: [answerColumnsFormatter],
      props: {
        style: {
          ...tableLayoutStyles.cell,
          ...styles.answerColumnCell
        }
      }
    }
  });

  getQuestionColumn = (sortable, numAnswers) => ({
    property: 'question',
    header: {
      label: i18n.question(),
      props: {style: tableLayoutStyles.headerCell}
    },
    cell: {
      formatters: [this.questionFormatter],
      props: {
        style: {
          ...tableLayoutStyles.cell,
          ...styles.questionCell
        }
      }
    }
  });

  getColumns = sortable => {
    let maxOptionsQuestion = [...this.props.multipleChoiceSurveyData]
      .sort(
        (question1, question2) =>
          question1.answers.length - question2.answers.length
      )
      .pop();

    const columnLabelNames = maxOptionsQuestion.answers.map(answer => {
      return this.getAnswerColumn(answer.multipleChoiceOption);
    });

    const numAnswerColumns = columnLabelNames.length + 1;
    return [
      this.getQuestionColumn(sortable, numAnswerColumns),
      ...columnLabelNames,
      this.getNotAnsweredColumn()
    ];
  };

  onBodyRow(row, {rowIndex, rowKey}) {
    return {
      style: {height: MIN_ROW_HEIGHT}
    };
  }

  render() {
    // Define a sorting transform that can be applied to each column
    const sortable = wrappedSortable(
      this.getSortingColumns,
      this.onSort,
      sortableOptions
    );
    const columns = this.getColumns(sortable);
    const sortingColumns = this.getSortingColumns();

    const sortedRows = sort.sorter({
      columns,
      sortingColumns,
      sort: orderBy
    })(this.props.multipleChoiceSurveyData);

    const questionIndex = this.state.selectedQuestionIndex;
    const questionData = this.props.multipleChoiceSurveyData[questionIndex];
    return (
      <div>
        {questionIndex >= 0 && (
          <MultipleChoiceSurveyQuestionDialog
            isDialogOpen={true}
            closeDialog={this.closeDialog}
            questionData={questionData}
          />
        )}
        <Table.Provider columns={columns} style={styles.table}>
          <Table.Header />
          <Table.Body rows={sortedRows} rowKey="id" onRow={this.onBodyRow} />
        </Table.Provider>
      </div>
    );
  }
}

export default MultipleChoiceSurveyOverviewTable;
