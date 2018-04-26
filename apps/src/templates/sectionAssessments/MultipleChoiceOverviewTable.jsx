import React, {Component, PropTypes} from 'react';
import {Table, sort} from 'reactabular';
import {tableLayoutStyles, sortableOptions} from "../tables/tableConstants";
import commonMsg from '@cdo/locale';
import wrappedSortable from '../tables/wrapped_sortable';
import orderBy from 'lodash/orderBy';
import MultipleChoiceAnswerCell from './MultipleChoiceAnswerCell';

export const COLUMNS = {
  QUESTION: 0,
  ANSWER_1: 1,
  ANSWER_2: 2,
  NOT_ANSWERED: 3,
};

const answerOptionsOneFormatter = (percentAnsweredOptionOne, {rowData}) => {
  return (
      <MultipleChoiceAnswerCell
        id={rowData.id}
        percentValue={rowData.percentAnsweredOptionOne}
        isCorrectAnswer={rowData.optionOneIsCorrect}
      />
  );
};

const answerOptionsTwoFormatter = (percentAnsweredOptionOne, {rowData}) => {
  return (
      <MultipleChoiceAnswerCell
        id={rowData.id}
        percentValue={rowData.percentAnsweredOptionTwo}
        isCorrectAnswer={rowData.optionTwoIsCorrect}
      />
  );
};

const notAnsweredFormatter = (percentAnsweredOptionOne, {rowData}) => {
  return (
      <MultipleChoiceAnswerCell
        id={rowData.id}
        percentValue={rowData.notAnswered}
      />
  );
};

const questionAnswerDataPropType = PropTypes.shape({
  id: PropTypes.number.isRequired,
  question: PropTypes.string,
  percentAnsweredOptionOne: PropTypes.string,
  percentAnsweredOptionTwo: PropTypes.string,
  optionOneIsCorrect: true,
  optionTwoIsCorrect: false,
  notAnswered: PropTypes.string,
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

  getColumns = (sortable) => {
    let dataColumns = [
      {
        property: 'question',
        header: {
          label: commonMsg.question(),
          props: {
            style: {
            ...tableLayoutStyles.headerCell,
          }},
          transforms: [sortable],
        },
        cell: {
          props: {
            style: {
            ...tableLayoutStyles.cell,
          }}
        }
      },
      {
        property: 'percentAnsweredOptionOne',
        header: {
          label: commonMsg.answerOptionA(),
          props: {
            style: {
            ...tableLayoutStyles.headerCell,
            width: 90,
          }},
        },
        cell: {
          format: answerOptionsOneFormatter,
          props: {
            style: {
            ...tableLayoutStyles.cell,
            width: 90,
          }}
        }
      },
      {
        property: 'percentAnsweredOptionTwo',
        header: {
          label: commonMsg.answerOptionB(),
          props: {
            style: {
            ...tableLayoutStyles.headerCell,
            width: 90,
          }},
        },
        cell: {
          format: answerOptionsTwoFormatter,
          props: {
            style: {
            ...tableLayoutStyles.cell,
            width: 90,
          }}
        }
      },
      {
        property: 'notAnswered',
        header: {
          label: commonMsg.notAnswered(),
          props: {
            style: {
            ...tableLayoutStyles.headerCell,
            width: 90,
          }},
        },
        cell: {
          format: notAnsweredFormatter,
          props: {
            style: {
            ...tableLayoutStyles.cell,
            width: 90,
          }}
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

export default MultipleChoiceOverviewTable;
