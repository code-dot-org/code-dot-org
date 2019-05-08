import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Table, sort} from 'reactabular';
import {tableLayoutStyles, sortableOptions} from '../tables/tableConstants';
import i18n from '@cdo/locale';
import wrappedSortable from '../tables/wrapped_sortable';
import orderBy from 'lodash/orderBy';
import PercentAnsweredCell from './PercentAnsweredCell';
import styleConstants from '@cdo/apps/styleConstants';
import {setQuestionIndex} from './sectionAssessmentsRedux';
import ReactTooltip from 'react-tooltip';
import {optionDataPropTypeMatch} from './assessmentDataShapes';

export const COLUMNS = {
  OPTION: 0
};

const ANSWER_COLUMN_WIDTH = 100;
const PADDING = 20;
const ANSWER_CHAR_LIMIT = 30;

const styles = {
  answerColumnHeader: {
    width: ANSWER_COLUMN_WIDTH,
    textAlign: 'center'
  },
  answerColumnCell: {
    width: ANSWER_COLUMN_WIDTH,
    padding: 0,
    height: 40
  },
  notAnsweredCell: {
    padding: 0,
    height: 40
  },
  questionCell: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  }
};

const NOT_ANSWERED = 'notAnswered';

const answerColumnsFormatter = (
  percentAnswered,
  {rowData, columnIndex, rowIndex, property}
) => {
  let percentValue = 0;
  const answerResults = rowData.answers[columnIndex - 1] || {};

  if (property === NOT_ANSWERED) {
    percentValue = Math.round(
      (rowData.notAnswered / rowData.totalAnswered) * 100
    );
  } else {
    percentValue = Math.round(
      (answerResults.numAnswered / rowData.totalAnswered) * 100
    );
  }

  return (
    <PercentAnsweredCell
      id={rowData.id}
      percentValue={percentValue}
      isCorrectAnswer={!!answerResults.isCorrect}
    />
  );
};

class MatchAssessmentsOverviewTable extends Component {
  static propTypes = {
    questionAnswerData: PropTypes.arrayOf(optionDataPropTypeMatch),
    setQuestionIndex: PropTypes.func.isRequired
  };

  state = {
    [COLUMNS.OPTION]: {
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

  optionFormatter = (option, {rowData, columnIndex, rowIndex, property}) => {
    if (option.includes('<img')) {
      return <div>{$(option).attr('alt')}</div>;
    } else {
      return <div>{`${option}`}</div>;
    }
  };

  getNotAnsweredColumn = () => ({
    property: NOT_ANSWERED,
    header: {
      label: i18n.notAnswered(),
      props: {
        style: {
          ...tableLayoutStyles.headerCell,
          ...styles.answerColumnHeader
        }
      }
    },
    cell: {
      format: answerColumnsFormatter,
      props: {
        style: {
          ...tableLayoutStyles.cell,
          ...styles.notAnsweredCell
        }
      }
    }
  });

  getColumnLabel = columnLabel => {
    if (columnLabel.includes('<img')) {
      return $(columnLabel).attr('alt');
    } else {
      return columnLabel.length < ANSWER_CHAR_LIMIT
        ? `${columnLabel}`
        : `${columnLabel.slice(0, ANSWER_CHAR_LIMIT)}...`;
    }
  };

  getAnswerColumn = columnLabel => ({
    property: 'percentAnswered',
    header: {
      label: this.getColumnLabel(columnLabel),
      props: {
        style: {
          ...tableLayoutStyles.headerCell,
          ...styles.answerColumnHeader
        },
        'data-for': `tooltipForOption${columnLabel}`,
        'data-tip': true
      }
    },
    cell: {
      format: answerColumnsFormatter,
      props: {
        style: {
          ...tableLayoutStyles.cell,
          ...styles.answerColumnCell
        }
      }
    }
  });

  getOptionColumn = (sortable, numAnswers) => ({
    property: 'option',
    header: {
      label: i18n.option(),
      props: {style: tableLayoutStyles.headerCell}
    },
    cell: {
      format: this.optionFormatter,
      props: {
        style: {
          ...tableLayoutStyles.cell,
          ...styles.questionCell,
          maxWidth:
            styleConstants['content-width'] -
            numAnswers * (ANSWER_COLUMN_WIDTH + PADDING)
        }
      }
    }
  });

  getColumns = sortable => {
    const columnLabelNames = this.props.questionAnswerData[0].answers.map(
      answer => {
        return this.getAnswerColumn(answer.answer);
      }
    );

    const numAnswerColumns = columnLabelNames.length + 1;
    return [
      this.getOptionColumn(sortable, numAnswerColumns),
      ...columnLabelNames,
      this.getNotAnsweredColumn()
    ];
  };

  renderTooltips() {
    return this.props.questionAnswerData[0].answers.map(answer => (
      <ReactTooltip
        id={`tooltipForOption${answer.answer}`}
        key={`tooltipForOption${answer.answer}`}
        role="tooltip"
        effect="solid"
      >
        {answer.answer.includes('<img')
          ? $(answer.answer).attr('alt')
          : answer.answer}
      </ReactTooltip>
    ));
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
    })(this.props.questionAnswerData);

    return (
      <div>
        <Table.Provider columns={columns} style={tableLayoutStyles.table}>
          <Table.Header />
          <Table.Body rows={sortedRows} rowKey="id" />
        </Table.Provider>
        {this.props.questionAnswerData[0].answers && this.renderTooltips()}
      </div>
    );
  }
}

export const UnconnectedMatchAssessmentsOverviewTable = MatchAssessmentsOverviewTable;

export default connect(
  state => ({}),
  dispatch => ({
    setQuestionIndex(questionIndex) {
      dispatch(setQuestionIndex(questionIndex));
    }
  })
)(MatchAssessmentsOverviewTable);
