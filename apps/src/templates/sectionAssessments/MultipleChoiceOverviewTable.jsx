import React, {Component, PropTypes} from 'react';
import {Table, sort} from 'reactabular';
import {tableLayoutStyles, sortableOptions} from "../tables/tableConstants";
import commonMsg from '@cdo/locale';
import wrappedSortable from '../tables/wrapped_sortable';
import orderBy from 'lodash/orderBy';
import MultipleChoiceAnswerCell from './MultipleChoiceAnswerCell';
import styleConstants from "@cdo/apps/styleConstants";

export const COLUMNS = {
  QUESTION: 0,
};

const ANSWER_COLUMN_WIDTH = 70;
const PADDING = 10;

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
  }
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

  if (property === NOT_ANSWERED) {
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
  percentValue: PropTypes.number,
  percentAnswered: PropTypes.number,
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
      property: NOT_ANSWERED,
      header: {
        label: commonMsg.notAnswered(),
        props: {
          style: {
            ...tableLayoutStyles.headerCell,
            ...styles.answerColumnHeader,
          }
        },
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
        props: {
          style: {
            ...tableLayoutStyles.headerCell,
            ...styles.answerColumnHeader,
          }
        },
      },
      cell: {
        format: answerColumnsFormatter,
        props: {
          style: {
            ...tableLayoutStyles.cell,
            ...styles.answerColumnCell,
          }
        },
      }
    }
  );

  getQuestionColumn = (sortable, numAnswers) => (
    {
      property: 'question',
      header: {
        label: commonMsg.question(),
        props: {style: tableLayoutStyles.headerCell},
        transforms: [sortable],
      },
      cell: {
        props: {
          style: {
            ...tableLayoutStyles.cell,
            ...styles.questionCell,
            maxWidth: styleConstants['content-width'] - (numAnswers * (ANSWER_COLUMN_WIDTH + PADDING * 2)),
          }
        },
      }
    }
  );

  getColumns = (sortable) => {
    const maxOptionsQuestion = [...this.props.questionAnswerData].sort((question1, question2) => (
      question1.answers.length - question2.answers.length
    )).pop();

    const columnLabelNames = maxOptionsQuestion.answers.map((answer) => {
      return this.getAnswerColumn(answer.multipleChoiceOption);
    });

    const numAnswerColumns = columnLabelNames.length + 1;
    console.log(numAnswerColumns);
    return [
      this.getQuestionColumn(sortable, numAnswerColumns),
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

